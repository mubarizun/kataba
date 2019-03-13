from __future__ import unicode_literals
import frappe, erpnext, json
from frappe.utils import flt, cstr, cint
from frappe import _
from erpnext.accounts.utils import get_account_currency

# pass frm.doc to parameter
# name, doctype, docstatus, update_stock, redeem_loyalty_points, is_pos, 
# frm, cost_center, umrah_sales_commission_account, gl_entries=None, repost_future_gle=True, from_repost=False

@frappe.whitelist()
def si_make_gl_entries(doc, doctype, name, cost_center, umrah_sales_commission_account, item_group):
    #cost_center = "Main - DUIB"
    #umrah_sales_commission_account = "2112.004 - Hutang Dagang Biaya Kirim Luar Negeri (SGD) - DUIB"
    gl_entries=None
    repost_future_gle=True
    from_repost=False
    new_doc = json.loads(doc)

    # frappe.msgprint("Make GL Entries...........")

    auto_accounting_for_stock = erpnext.is_perpetual_inventory_enabled(new_doc["company"])

    if not gl_entries:
        gl_entries = get_gl_entries(new_doc, doctype, cost_center, umrah_sales_commission_account, item_group)
        
    if gl_entries:
        # frappe.msgprint("Entries found.")
        from erpnext.accounts.general_ledger import make_gl_entries

        # if POS and amount is written off, updating outstanding amt after posting all gl entries
        update_outstanding = "No" if (cint(new_doc["is_pos"]) or cint(new_doc["redeem_loyalty_points"])) else "Yes"
        
        # frappe.msgprint("Attempt to make gl entries")
        make_gl_entries(gl_entries,update_outstanding=update_outstanding, merge_entries=False)
        frappe.msgprint("All done.")
        
        # if update_outstanding == "No":
        #     from erpnext.accounts.doctype.gl_entry.gl_entry import update_outstanding_amt
        #     update_outstanding_amt(self.debit_to, "Customer", self.customer,
        #         self.doctype, self.return_against if cint(self.is_return) and self.return_against else self.name)

        # if repost_future_gle and cint(self.update_stock) \
        #     and cint(auto_accounting_for_stock):
        #         items, warehouses = self.get_items_and_warehouses()
        #         update_gl_entries_after(self.posting_date, self.posting_time, warehouses, items)
# ---------------------------------------------------------------------------------------------
    elif new_doc["docstatus"] == 2 and cint(new_doc["update_stock"]):
        from erpnext.accounts.general_ledger import delete_gl_entries

        delete_gl_entries(voucher_type=doctype, voucher_no=name)

@frappe.whitelist()
def make_journal_entry(doc, gl_entries):
    new_accounts = []
    for entry in gl_entries:
        new_accounts.append({
            "account": entry.account,
            "party_type": entry.party_type if entry.party_type else "",
            "party": entry.party if entry.party else "",
            "debit_in_account_currency": entry.debit if entry.debit != None else 0,
            "credit_in_account_currency": entry.credit if entry.credit != None else 0
        })

    je = frappe.get_doc({
        "doctype": "Journal Entry",
        "voucher_type": "Journal Entry",
        "company":doc["company"],
        "accounts": new_accounts,
        "posting_date": doc["posting_date"],
        "cheque_no":doc["name"],
        "cheque_date":doc["posting_date"]
    })
    
    je.insert()
    return str(je.name)
    

@frappe.whitelist()
def get_gl_entries(doc, doctype, cost_center, umrah_sales_commission_account, item_group, warehouse_account=None):
    from erpnext.accounts.general_ledger import merge_similar_entries

    gl_entries = []

    make_commission_gl_entries(doc, doctype, cost_center, umrah_sales_commission_account, gl_entries)
    make_commission_payable_gl_entries(doc, doctype, cost_center, item_group, gl_entries)
    je = make_journal_entry(doc, gl_entries)
    for entry in gl_entries:
        entry.voucher_no = je
    
    # merge gl entries before adding pos entries
    gl_entries = merge_similar_entries(gl_entries)
    # frappe.msgprint(str(gl_entries))

    return gl_entries

# rounded_total, rounding_adjustment, grand_total, conversion_rate, debit_to, customer, [", party_account_currency, company_currenc"]y
@frappe.whitelist()
def make_commission_gl_entries(doc, doctype, cost_center, umrah_sales_commission_account, gl_entries):

    # Checked both rounding_adjustment and rounded_total
    # because rounded_total had value even before introcution of posting GLE based on rounded total
    grand_total = doc["rounded_total"] if (doc["rounding_adjustment"] and doc["rounded_total"]) else doc["grand_total"]
    if grand_total:
        # Didnot use base_grand_total to book rounding loss gle
        grand_total_in_company_currency = flt(grand_total * doc["conversion_rate"])

        # added: company, cost_center, voucher_type, voucher_no
        # party's doctype should be the same with party_type
        # ToDo: Make fiscal_year become dynamic, make auto create supplier on new sales partner, add posted_date
        gl_entries.append(
            frappe._dict({
                "account": umrah_sales_commission_account,
                "voucher_type": "Journal Entry",
                "voucher_no": "journal entry no",
                "company": doc["company"],
                "party_type": "Supplier",# Temporary, change immediately
                "party": doc["sales_partner"],
                "against": doc["against_income_account"],
                "credit": doc["mgs_total_commission"],
                "credit_in_account_currency": doc["mgs_total_commission"],
                "against_voucher": doc["return_against"] if cint(doc["is_return"]) and doc["return_against"] else doc["name"],
                "against_voucher_type": doctype,
                "remarks": "make_commission_gl_entries test",# Temporary, change immediately
                "cost_center":cost_center,
                "fiscal_year": "2019",# Temporary, change immediately
                "posting_date": doc["posting_date"]
            })
            # , doc["party_account_currency"]
        )
    # frappe.msgprint("make_commission_gl_entries, done")

@frappe.whitelist()
def make_commission_payable_gl_entries(doc, doctype, cost_center, item_group, gl_entries):
    # frappe.msgprint(str(doc["items"]))
    # income account gl entries
    for item in doc["items"]: # remove this loop if item.cost_center isnt necessary
        if (item["item_group"] == item_group):
            # frappe.msgprint(item["item_group"])
            # if flt(item.base_net_amount, item.precision("base_net_amount")):
            if flt(item["base_net_amount"]):
                if item["is_fixed_asset"]:
                    frappe.msgprint("custom/sales_invoice.py: Item has no asset in field list.")
                    # asset = frappe.get_doc("Asset", item.asset)

                    # fixed_asset_gl_entries = get_gl_entries_on_asset_disposal(asset, item.base_net_amount)
                    # for gle in fixed_asset_gl_entries:
                    #     gle["against"] = sales_partner
                    #     gl_entries.append(self.get_gl_dict(gle))

                    # asset.db_set("disposal_date", posting_date)
                    # asset.set_status("Sold" if frm.docstatus==1 else None)
                else:
                    account_currency = get_account_currency(item["income_account"])

                    gl_entries.append(
                        frappe._dict({
                            "account": item["income_account"] if not item["enable_deferred_revenue"] else item["deferred_revenue_account"],
                            "against": doc["sales_partner"],
                            "company": doc["company"],
                            "debit": doc["mgs_total_commission"],
                            "debit_in_account_currency": doc["mgs_total_commission"],
                            "remarks": "make_commission_payable_gl_entries test",# Temporary, change immediately
                            "cost_center":item["cost_center"],
                            "voucher_type": "Journal Entry",# Temporary, change immediately
                            "voucher_no": "journal entry no",
                            "fiscal_year": "2019",# Temporary, change immediately
                            "posting_date": doc["posting_date"]  
                        })
                        # , account_currency
                    )
    # frappe.msgprint("make_commission_payable_gl_entries, done")
    # expense account gl entries
    # if cint(self.update_stock) and \
    #     erpnext.is_perpetual_inventory_enabled(self.company):
    #     gl_entries += super(SalesInvoice, self).get_gl_entries()

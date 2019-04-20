from __future__ import unicode_literals
import frappe, json

@frappe.whitelist()
def run_sql(sql):
	# For development only, remove on production
	return frappe.db.sql(sql)

@frappe.whitelist()
def test():
	pi = frappe.get_doc({
		"doctype": "Purchase Invoice",
		"credit_to": "2111.001 - Hutang Dagang Dalam Negeri - DUIB",
		"items": [
			{"item_code": "TKOA99", "qty": 11}
		]
	})
	pi.insert()

@frappe.whitelist()
def create_kelengkapan_umrah(frm_name, customer, count, item_code, item_name, grand_total):
	# doc = frappe.new_doc("Kelengkapan Umrah")
	# doc.update({

	# })
	kelengkapan_umrah = frappe.get_doc({
		"doctype": "Kelengkapan Umrah",
		"sales_order": frm_name,
		"contact": customer,
		"count": count,
		"total_sales_order": grand_total,
		"total_pembayaran": 0,
		"item": item_code,
		"customer": customer,
		"items": [
			{"item_code": item_code, "item_name": item_name, "against_sales_order": frm_name, "customer": customer, "count": count}
		]
	})
	kelengkapan_umrah.insert()

@frappe.whitelist()
def make_new_VA(VANO, docname):
	va = frappe.get_doc({
		"doctype": "Virtual Account",
		"virtual_account_no": VANO,
		"sales_order_no":docname,
		"status":"Planned"
	})
	va.insert()

	return str(va.name)

@frappe.whitelist()
def get_VA():
	sql = "select name from `tabVirtual Account`"
	return frappe.db.sql(sql)

@frappe.whitelist()
def update_VA_field(VANO, docname):
	sql = "update `tabSales Order` set virtual_account='" + VANO + "' where name='" + docname + "'"
	return frappe.db.sql(sql)

@frappe.whitelist()
def delete_VA(VANO, docname):
	#sql = "update `tabSales Order` set virtual_account=NULL where name ='"+docname+"'"
	#frappe.db.sql(sql)
	sql = "update `tabVirtual Account` set status = 'cancelled' where name ='"+VANO+"'"
	return frappe.db.sql(sql)

@frappe.whitelist()
def new_journal_entry(doc):
	from datetime import datetime
	doc = json.loads(doc)

	def get_je_items():
		return {
		"doctype": "Journal Entry",
		"voucher_type": "Journal Entry",
		"naming_series": "ACC-JV-.YYYY.-",
		"company": doc["company"],
		"posting_date": str(datetime.now())[:str(datetime.now()).index(" ")],
		"cheque_no": doc["name"],
		"cheque_date": doc["posting_date"]
	}

	je_item_1 = get_je_items()

	je_item_1["accounts"] = [
		{
			"account": doc["debit_to"],
			"cost_center": "Main - DTT", # change later
			"debit_in_account_currency": doc["agent_commission_rate"],
			"party_type": "Customer", # change later
			"party": "Customer 1", # change later
		},
		{
			"account": "2141.000 - Hutang Pajak - DTT", # change later
			"party_type": "Supplier",
			"party": doc["sales_partner"],
			"cost_center": "Main - DTT", # change later
			"credit_in_account_currency": doc["agent_commission_rate"]
		}
	]

	je_item_2 = get_je_items()

	je_item_2["accounts"] = [
		{
			"account": doc["debit_to"],
			"cost_center": "Main - DTT", # change later
			"debit_in_account_currency": doc["territory_commission_rate"],
			"party_type": "Customer", # change later
			"party": "Customer 1", # change later
		},
		{
			"account": "2141.000 - Hutang Pajak - DTT", # change later
			"party_type": "Supplier",
			"party": doc["sales_partner"], # change later
			"cost_center": "Main - DTT", # change later
			"credit_in_account_currency": doc["territory_commission_rate"]
		}
	]

	a = frappe.get_doc(je_item_1).insert()
	b = frappe.get_doc(je_item_2).insert()
	a.submit()
	b.submit()
	return ({"item_1":a.name,"item_2":b.name})
	
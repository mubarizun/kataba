from __future__ import unicode_literals
import frappe

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

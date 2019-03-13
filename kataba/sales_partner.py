from __future__ import unicode_literals
import frappe, json

@frappe.whitelist()
def make_supplier(raw_doc, gl_entries):
    doc = json.loads(raw_doc)

    sup = frappe.get_doc({
        "doctype": "Supplier",
        "supplier_name": doc["name"],
        "supplier_type": "Individual"
    })
    sup.insert()

    return str(sup)
# -*- coding: utf-8 -*-
# Copyright (c) 2019, Kataba and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class KelengkapanUmrah(Document):	
	pass
	# def on_submit(self):
	# 	for item in self.items:
	# 		if item["item_group"] == "Umrah":
	# 			kelengkapan_umrah = frappe.get_doc({
	# 				"doctype": "Kelengkapan Umrah",
	# 				"sales_order": frm_name,
	# 				"customer": customer
	# 			})
	# 			kelengkapan_umrah.insert()

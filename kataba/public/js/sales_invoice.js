frappe.ui.form.on("Sales Invoice", {
    onload: function(frm) {
        if (frm.doc.sales_partner !== "" && frm.doc.status === "Draft") {
            isCommissionsValid = setCommissionValues(frm);
        }

		disableVirtualAccountField(100);
    },
    sales_partner: function(frm) {
        isCommissionsValid = setCommissionValues(frm);     
    },
    items: function(frm) {
        if (frm.doc.sales_partner !== "") {
            isCommissionsValid = setCommissionValues(frm);
        }
    },
    on_submit: function(frm) {
        if (frm.doc.mgs_total_commission > 0) {
            frappe.call({ // Get Company info
                "method": "frappe.client.get",
                args: {
                    "doctype": "Company",
                    "filters": {'name': frm.doc.company}
                },
                callback: function (data) {
                    frappe.call({ // Create new GL Entries
                        "method": "kataba.sales_invoice.si_make_gl_entries",
                        args: {
                            "doc": frm.doc,
                            "doctype": frm.doctype,
                            "name": frm.docname,
                            "cost_center": data.message.cost_center,
                            "umrah_sales_commission_account":data.message.umrah_sales_commission_account,
                            "item_group": data.message.umrah_item_group
                        },
                        callback: function (data) {
                            console.log("callback:", data)
                        },
                        error: function (err) {
                            console.log(err)
                        }
                    })
                }
            })
        }
    },
    validate: function (frm) {
		if (!isCommissionsValid) {
			frappe.validated = false;
			frappe.msgprint("Check your Items");
		}
	}
});

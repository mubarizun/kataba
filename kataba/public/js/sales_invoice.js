function si_getCompanyInfo(frm) {
    frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Company",
			"filters": {'company_name': frm.doc.company}
		},
		callback: function (data) {
            var item_group = "";
            
            // Fetch umrah_item_group value
            item_group = data.message.umrah_item_group;
            if (frm.doc.sales_partner === "" || frm.doc.sales_partner === undefined) {
                removeCommissionData(frm)
            }else{
                si_setCommissionData(frm, item_group);
            }
        }
    })
}

function si_setCommissionData(frm, item_group) {
    frappe.call({
        "method": "frappe.client.get",
        args: {
            "doctype": "Sales Partner",
            "filters": {'partner_name': frm.doc.sales_partner}
        },
        callback: function (data) {
            // frappe.model.set_value(doctype, name, fieldname, value)
            
            // Counting parameters
            var total_commission = 0;
            var umrahItemCount = 0;
            var amount = 0;
            for (var i=0; i < frm.doc.items.length; i++) {
                if (frm.doc.items[i].item_group === item_group) {
                    umrahItemCount += frm.doc.items[i].qty;
                    amount+=frm.doc.items[i].amount;
                }
            }

            if (data.message.mgs_commission_type === "Value") {
                total_commission = umrahItemCount*data.message.mgs_commission_rate
            }else if (data.message.mgs_commission_type === "Percentage") {
                total_commission = amount*(data.message.mgs_commission_rate/100)
            }
            
            // Set value to mgs_commission_rate field
            if (frm.doc.sales_partner!==undefined){
                frappe.model.set_value(frm.doctype, frm.docname, "mgs_commission_rate", data.message.mgs_commission_rate)
                frappe.model.set_value(frm.doctype, frm.docname, "mgs_total_commission", total_commission);
            }else{
                frappe.model.set_value(frm.doctype, frm.docname, "mgs_commission_rate", "")
                frappe.model.set_value(frm.doctype, frm.docname, "mgs_total_commission", "");
            }
        }
    })
}

function removeCommissionData(frm) {
    frappe.model.set_value(frm.doctype, frm.docname, "mgs_commission_rate", 0);
    frappe.model.set_value(frm.doctype, frm.docname, "mgs_total_commission", 0);
    frappe.model.set_value(frm.doctype, frm.docname, "total_commission", 0);
    frappe.model.set_value(frm.doctype, frm.docname, "commission_rate", 0);
}

frappe.ui.form.on("Sales Invoice", {
    onload: function(frm) {
        if (frm.doc.sales_partner !== "" && frm.doc.status === "Draft") {
            si_getCompanyInfo(frm);
        }
        setTimeout(()=>{getElementByXpath('//input[@data-fieldname="virtual_account"]').disabled = true}, 2000);
    },
    sales_partner: function(frm) {
        si_getCompanyInfo(frm);     
    },
    items: function(frm) {
        if (frm.doc.sales_partner !== "") {
            si_getCompanyInfo(frm);
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
    }
});

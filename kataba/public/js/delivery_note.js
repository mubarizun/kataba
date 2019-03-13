function dn_getCompanyInfo(frm) {
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
            
            dn_setCommissionData(frm, item_group);
        }
    })
}

function dn_setCommissionData(frm, item_group) {
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
            for (var i=0; i < cur_frm.doc.items.length; i++) {
                if (cur_frm.doc.items[i].item_group === item_group) {
                    umrahItemCount += cur_frm.doc.items[i].qty;
                    amount+=cur_frm.doc.items[i].amount;
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

function dn_changeDeliveryNoteOnKelengkapanUmrah(frm){
	items = frm.doc.items;
	for (var i=0; i < items.length; i++){
		var sql = "update `tabUmrah Ordered Item` set against_delivery_note='" + frm.doc.name + "'  where against_sales_order='" + items[i].againts_sales_order + "';"
		frappe.call({
        		"method": "kataba.client.run_sql",
        		args: {
        			"sql": sql
        		},
        		async: false
    		})
	}
}

frappe.ui.form.on("Delivery Note", {
    onload: function(frm) {
        if (frm.doc.sales_partner !== "" && frm.doc.status === "Draft") {
            dn_getCompanyInfo(frm);
        }
        setTimeout(()=>{getElementByXpath('//input[@data-fieldname="virtual_account"]').disabled = true}, 2000);
    },
    sales_partner: function(frm) {
        dn_getCompanyInfo(frm);
    },
    items: function(frm) {
        if (frm.doc.sales_partner !== "") {
            dn_getCompanyInfo(frm);
        }
    },
    on_submit: function(frm) {
	dn_changeDeliveryNoteOnKelengkapanUmrah(frm);
    }
});

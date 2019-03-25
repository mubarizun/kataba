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
        dn_changeDeliveryNoteOnKelengkapanUmrah(frm);
    },
    validate: function (frm) {
		if (!isCommissionsValid) {
			frappe.validated = false;
			frappe.msgprint("Check your Items");
		}
	}
});

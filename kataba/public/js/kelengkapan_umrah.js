function ku_checkIsCompleted(frm){
	console.log(frm.doc);
	console.log(frm.doc.total_sales_order);
	for (var i=0; i<frm.doc.kelengkapan_jamaah.length; i++){
		if (frm.doc.kelengkapan_jamaah[i].ada == 0){
			return false;
		}
	}

	for (var i=0; i<frm.doc.kelengkapan_peralatan.length; i++){
                if (frm.doc.kelengkapan_peralatan[i].ada == 0){
                        return false;
                }
        }

	if (frm.doc.total_sales_order > frm.doc.total_pembayaran){
		return false;
	}

	return true;

}

function ku_updateCustomer(frm){
//                var sql = "update `tabUmrah Ordered Item` set customer='" + frm.doc.contact + "'  where name='" + frm.doc.name + "';"
//		console.log(sql);
//                frappe.call({
//                        "method": "kataba.client.run_sql",
//                        args: {
//                                "sql": sql
//                        }
//                })
	frappe.model.set_value("Umrah Ordered Item", frm.docname, "customer", frm.doc.contact)
	console.log("CUSTOMER CHANGED");
}

frappe.ui.form.on("Kelengkapan Umrah", {
	before_save: function(frm) {
		console.log(frm.doctype);
		console.log(frm.docname);
		ku_updateCustomer(frm);
		if (ku_checkIsCompleted(frm)){
			frappe.model.set_value(frm.doctype, frm.docname, "status", "Completed");
		}
		else {
        		frappe.model.set_value(frm.doctype, frm.docname, "status", "Created");
		}
	}
})

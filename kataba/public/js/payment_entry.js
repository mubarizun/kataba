function pe_changeAgainstPaymentEntry(frm){
	references = frm.doc.references;
	for (var i=0; i<references.length; i++) {
		if (references[i].reference_doctype == "Sales Order"){
			var sql = "update `tabUmrah Ordered Item` set against_payment_entry='" + frm.doc.name + "'  where against_sales_order='" + references[i].reference_name + "';";
			frappe.call({
                        	"method": "kataba.client.run_sql",
                        	args: {
                                	"sql": sql
                        	},
                        	async: false
                	})
		}
	}
}

frappe.ui.form.on("Payment Entry", {
    on_submit: function (frm) {
	pe_changeAgainstPaymentEntry();
    }
});

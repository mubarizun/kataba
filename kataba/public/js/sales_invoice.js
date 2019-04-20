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
			frappe.call({
				"method":"kataba.client.new_journal_entry",
				args: {
					"doc": frm.doc
				},
				callback: function(data){
					console.log(data.message)
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

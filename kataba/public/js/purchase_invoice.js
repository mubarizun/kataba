function setBilledInvoiceAccount(frm) {
        frappe.call({
                "method": "frappe.client.get",
                args: {
                        "doctype": "Company",
                        "filters": {'name': frm.doc.company}
                },
                callback: function (data) {
                        console.log(data.message.supplier_link)
                        console.log(data.message.umrah_stock_received_but_not_billed_invoice_account);
                        console.log("AA");
                        if (frm.doc.is_pnr == 1 && isSupplierInChildTableInvoice(data.message.supplier_link, frm.doc.supplier_name, frm.doc.company)){
				console.log("TRUE PI");
                                var sql = "update `tabGL Entry` set account='" + data.message.umrah_stock_received_but_not_billed_invoice_account + "' where voucher_no='" + frm.doc.name + "' and account='" + data.message.stock_received_but_not_billed + "'"
                                frappe.call({
                                        "method": "kataba.client.run_sql",
                                        args: {
                                                "sql": sql
                                        }
                                })
                        }
                }
        })
}

function isSupplierInChildTableInvoice(link, supplier, parent) {
        for (var i=0; i < link.length; i++){
		if (link[i]["supplier"] == supplier && link[i]["parent"] == parent) {
			return true;
		}
	}
	return false;
}

frappe.ui.form.on("Purchase Invoice", {
	on_submit: function(frm) {
		setBilledInvoiceAccount(frm);
	},
	before_submit: function (frm) {
		var message = "";
                frappe.call({
                "method": "frappe.client.get",
                args: {
                        "doctype": "Company",
                        "filters": {'name': frm.doc.company}
                },
                async: false,
                callback: function (data) {
                        console.log(data);
                        if (data.message.umrah_stock_received_but_not_billed_receive_account == null && data.message.umrah_stock_received_but_not_billed_invoice_account == null){
                                message = "Umrah Stock Received But Not Billed Receive Account has no value and Umrah Stock Received But Not Billed Receive Account has no value";
                        }
                        else if (data.message.umrah_stock_received_but_not_billed_receive_account == null){
                                message = "Umrah Stock Received But Not Billed Receive Account has no value";
                        }
                        else if (data.message.umrah_stock_received_but_not_billed_invoice_account == null){
                                message = "Umrah Stock Received But Not Billed Invoice Account";
                        }
                        else {
                                message = "";
                	}
        	}
	        })
                if (message != ""){
                        frappe.throw(message);
			return false;
                }

	}
})

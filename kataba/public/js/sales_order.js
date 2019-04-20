function so_createKelengkapanUmrah(frm) {
	console.log(frm.doc.items);

	items = frm.doc.items
	umrah_item_count = 0;
	for (var i = 0; i < items.length; i++) {
		if (items[i]["item_group"] == "Umrah") {
			// var sql = "INSERT INTO `tabKelengkapan Umrah` (name, sales_order, customer) VALUES ('KU-" + frm.doc.name + "-" + frm.doc.customer + "', '" + frm.doc.name + "', '" + frm.doc.customer + "');"
			umrah_item_count += 1;
			frappe.call({
				"method": "kataba.client.create_kelengkapan_umrah",
				args: {
					"frm_name": frm.doc.name,
					"customer": frm.doc.customer,
					"count": umrah_item_count,
					"item_code": items[i].item_code,
			"item_name": items[i].item_name,
			"grand_total": frm.doc.grand_total
				}
			})
			for (var j = 1; j < items[i].qty; j++) {
				umrah_item_count += 1;
				frappe.call({
					"method": "kataba.client.create_kelengkapan_umrah",
					args: {
						"frm_name": frm.doc.name,
						"count": umrah_item_count,
						"item_code": items[i].item_code,
						"item_name": items[i].item_name,
			"customer": "",
			"grand_total": frm.doc.grand_total
					}
				})
				console.log("CALLED");
			}
		}
	}
}

function so_cancelKelengkapanUmrah(frm) {
	console.log("CANCELLED");
	var sql = "update `tabKelengkapan Umrah` set status='Cancelled' where sales_order='" + frm.doc.name + "';"
	frappe.call({
		"method": "kataba.client.run_sql",
		args: {
			"sql": sql
		},
		async: false
	})
	console.log("CANCELLED OK");
}

function so_changeKelengkapanUmrah(frm) {
	console.log("AMEND");

	var sql = "update `tabKelengkapan Umrah` set status='Created', sales_order='" + frm.doc.name + "'  where sales_order='" + frm.doc.amended_from + "';"
	frappe.call({
		"method": "kataba.client.run_sql",
		args: {
			"sql": sql
		},
		async: false
	})

	var sql1 = "update `tabUmrah Ordered Item` set against_sales_order='" + frm.doc.name + "'  where against_sales_order='" + frm.doc.amended_from + "';"
	frappe.call({
		"method": "kataba.client.run_sql",
		args: {
			"sql": sql1
		},
		async: false
	})


	console.log("AMEND OK");
}

function so_generateVirtualAccountNo(frm) {
	Number.prototype.pad = function(size) {
		var s = String(this);
		while (s.length < (size || 2)) {s = "0" + s;}
		return s;
	}
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "VA Setup",
			"filters": { 'name': frm.doc.company }
		},
		callback: function (data) {
			var newVA = "";
			var newID = "";
			var newRunningNumber = "";

			newVA += data.message.company_prefix
			var typeFound = false;
			productPrefix = data.message.product_prefix;
			function comparePrioritas(a,b) {
				if (a.prioritas < b.prioritas)
					return -1;
				if (a.prioritas > b.prioritas)
					return 1;
				return 0;
			}
			productPrefix.sort(comparePrioritas);

			for (var i = 0; i < productPrefix.length; i++){
				pp = productPrefix[i]

				if (pp.document_type === "Project" && pp.document_type_id === frm.doc.project  && !typeFound) {
					newVA += pp.id;
					newID += pp.id;
					typeFound = true;
				}else if (pp.document_type === "Item Group") {
					for (var j = 0; j < frm.doc.items.length; j++) {
						if (pp.document_type_id === getParentItemGroup(frm.doc.items[j].item_group) && !typeFound){
							newVA += pp.id;
							newID += pp.id;
							typeFound = true;
						}
					}
				}else {
					if (!typeFound) {
						newID += "11";
						newVA += "11";
						typeFound = true;
					}
				}
			}

			var fullDate = new Date();
			var date = fullDate.getFullYear();
			date = date.toString();
			date = date.substring(2);
			newVA += date;

			frappe.call({"method": "kataba.client.get_VA",
				callback: function (d) {
					var prefixes = [];
					var idFound = false;
					for (var i = 0; i<d.message.length;i++){
						id = d.message[i].toString().substring(4, 6);
						runningNumber = parseInt(d.message[i].toString().substring(10));
						prefixes.push({
							id: id,
							runningNumber: runningNumber
						});
					}
					function compareRunningNumber(a,b) {
						if (a.runningNumber < b.runningNumber)
							return 1;
						if (a.runningNumber > b.runningNumber)
							return -1;
						return 0;
					}
					prefixes.sort(compareRunningNumber);
					for (var i = 0; i<prefixes.length;i++){
						if (prefixes[i].id == newID) {
							// console.log("ID:" + prefixes[i].id, "numb: " + prefixes[i].runningNumber)
							newRunningNumber = (prefixes[i].runningNumber + 1).pad(8);
							idFound = true;
							break;
						}
					}

					if (d.message.length === 0 || !idFound) {
						newRunningNumber = (1).pad(8);
					}
					newVA += newRunningNumber;

					frappe.call({
						"method": "kataba.client.make_new_VA",
						args: {
							"VANO": newVA,
							"docname": frm.doc.name
						},
						callback: function (make_new_va_data) {
							frm.set_value("virtual_account", make_new_va_data.message);

							frappe.call({
								"method": "kataba.client.update_VA_field",
								args: {
									"VANO": make_new_va_data.message,
									"docname": frm.doc.name
								},
								callback: function (update_va_field_data) {
									console.log("Virtual Account created.");
								}
							})
						}
					})
				}
			})
		}
	})
}

function so_deleteVirtualAccountNo(frm) {
	frappe.call({
		"method": "kataba.client.delete_VA",
		args: {
			"VANO": frm.doc.virtual_account,
		"docname": frm.doc.name
		},
		callback: function (data) {
			console.log("Virtual Account deleted.");
		}
	})
}

frappe.ui.form.on("Sales Order", {
	onload: function (frm) {
		if (frm.doc.sales_partner !== "" && frm.doc.status === "Draft") {
			isCommissionsValid = setCommissionValues(frm);
		}
		
		disableVirtualAccountField(100);
	},

	sales_partner: function (frm) {
		if (frm.doc.sales_partner != null) {
			isCommissionsValid = setCommissionValues(frm);
		}
	},

	items: function (frm) {
		if (frm.doc.sales_partner != null || frm.doc.sales_partner !== "") {
			isCommissionsValid = setCommissionValues(frm);
		}
	},

	on_submit: function (frm) {
		// console.log(frm.doc.amended_from);
		if (frm.doc.amended_from == null) {
			so_createKelengkapanUmrah(frm);
		} else {
			so_changeKelengkapanUmrah(frm);
		}
		so_generateVirtualAccountNo(frm);
	},

	before_cancel: function (frm) {
		so_cancelKelengkapanUmrah(frm);
		so_deleteVirtualAccountNo(frm);
	},

	validate: function (frm) {
		if (!isCommissionsValid) {
			frappe.validated = false;
			frappe.msgprint("Check your Items");
		}
	}
});

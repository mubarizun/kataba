// function setCommissionData(frm) {
// 	frappe.call({
// 		"method": "frappe.client.get",
// 		args: {
// 			"doctype": "Sales Partner Type",
// 			"filters": {'sales_partner_type': frm.doc.partner_type}
// 		},
// 		callback: function (data) {
// 			// frappe.model.set_value(doctype, name, fieldname, value)
// 			frappe.model.set_value(frm.doctype, frm.docname, "agent_commission_rate",data.message.agent_commission_rate)
// 		}
// 	})
// }

// frappe.ui.form.on("Sales Partner", {
// 	setup: function(frm) {
// 		frm.set_query("territory", function() {
// 			return {
// 				filters: [
// 					["Territory","is_group", "=", 0]
// 				]
// 			}
// 		});
// 	},

// 	refresh: function(frm) {
// 		if (frm.doc.partner_type != null) {
// 			setCommissionData(frm);
// 		}
// 	},

// 	onload: function(frm) {
// 		if (frm.doc.partner_type != null) {
// 			setCommissionData(frm);
// 		}
// 		cur_frm.set_value("commission_rate", 0);
// 	},

// 	partner_type: function(frm) {
// 		if (frm.doc.partner_type != null) {
// 			setCommissionData(frm);
// 		}else {
// 			cur_frm.set_value("agent_commission_rate", 0);
// 		}
// 	}
// })

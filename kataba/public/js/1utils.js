let isCommissionsValid; //Sales invoice, sales order, delivery note

function getElementByXpath(path) { //Sales invoice, sales order, delivery note
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function disableVirtualAccountField(time) { //Sales invoice, sales order, delivery note
    if(getElementByXpath('//input[@data-fieldname="virtual_account"]') != null) {
        setTimeout(function() {
            getElementByXpath('//input[@data-fieldname="virtual_account"]').disabled = true;
        }, 2000);
        return;
    }
    else {
        setTimeout(function() {
            disableVirtualAccountField(time);
        }, time);
    }
}

const setCommissionValues = frm => { //Sales invoice, sales order, delivery note
	if (frm.doc.sales_partner !== "" && frm.doc.sales_partner !== undefined) {
		let agent_commission_rate = 0;
		let territory_commission_rate = 0;

		item_group = getCompanyItemGroup(frm.doc.company);

		frm.doc.items.forEach(item => {
			// if (getParentItemGroup(item.item_group) === getCompanyItemGroup(cur_frm.doc.company)) {
				if (item.agent_commission_rate != 0 && item.territory_commission_rate != 0) {
					agent_commission_rate += item.agent_commission_rate*item.qty;
					territory_commission_rate += item.territory_commission_rate;
				}else {
					let itemGroupCommissions = getItemGroupCommissionValues(item.item_group);
					if (itemGroupCommissions.agent_commission_rate != 0 && itemGroupCommissions.territory_commission_rate != 0) {
						agent_commission_rate += itemGroupCommissions.agent_commission_rate*item.qty;
						territory_commission_rate += itemGroupCommissions.territory_commission_rate;
					} else {
						frappe.msgprint("Commission Rate not found in Item or Item Group. error item: "+item.item_name);
					}
				}
			// }
		});

		console.log("setCommissionValues", agent_commission_rate, territory_commission_rate);

		if (agent_commission_rate != 0 && territory_commission_rate != 0) {
			frm.set_value("agent_commission_rate", agent_commission_rate);
			frm.set_value("territory_commission_rate", territory_commission_rate);
			frm.set_value("mgs_total_commission", agent_commission_rate + territory_commission_rate);
			return true;
		} else {
			// frm.set_value("sales_partner", "");
			// return false;
			return true
		}
	}
	return true
}

const getParentItemGroup = itemGroup => { //Sales invoice, sales order, delivery note
	let parent;
	if (itemGroup !== "Paket Umrah") {
		frappe.call({
			"method": "frappe.client.get",
			args: {
				"doctype": "Item Group",
				"filters": { 'name': itemGroup }
			},
			async: false,
			callback: function (data) {
				if (data.message.parent_item_group === "Paket Umrah") {
					parent = itemGroup;
				}else{
					parent = getParentItemGroup(data.message.parent_item_group);
				}
			}
		});
	}
	// console.log("getParentItemGroup", parent);
	return parent;
}

const getRootItemGroup = itemGroup => { // Item
	let parent;
	if (itemGroup !== "All Item Groups") {
		frappe.call({
			"method": "frappe.client.get",
			args: {
				"doctype": "Item Group",
				"filters": { 'name': itemGroup }
			},
			async: false,
			callback: function (data) {
				if (data.message.parent_item_group === "All Item Groups") {
					parent = itemGroup;
				}else{
					parent = getRootItemGroup(data.message.parent_item_group);
				}
			}
		});
	}
	// console.log("getParentItemGroup", parent);
	return parent;
}

const getCompanyItemGroup = companyName => { //Sales invoice, sales order, delivery note
	let itemGroup;
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Company",
			"filters": { 'company_name': companyName }
		},
		async: false,
		callback: function (data) {
			itemGroup = data.message.umrah_item_group;
		}
	});
	return itemGroup;
}

const getItemGroupCommissionValues = item_group => { //Sales invoice, sales order, delivery note
	let agent_commission_rate;
	let territory_commission_rate;
	frappe.call({
		"method": "frappe.client.get",
		args: {
			"doctype": "Item Group",
			"filters": { 'name': item_group }
		},
		async: false,
		callback: function (data) {
			agent_commission_rate = data.message.agent_commission_rate;
			territory_commission_rate = data.message.territory_commission_rate;
		}
	});
	return {agent_commission_rate, territory_commission_rate};
}

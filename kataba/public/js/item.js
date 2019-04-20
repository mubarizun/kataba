const toggleUmrahSection = (frm) => {
    let root_parent = getRootItemGroup(frm.doc.item_group);
    let company_item_group = getCompanyItemGroup("Duta Telaga Takwa")
    root_parent === company_item_group ? frm.toggle_display("umrah_section", true) : ""
}

frappe.ui.form.on("Item", {
    onload: function(frm) {
        toggleUmrahSection(frm)
    },
    refresh: function(frm) {
        toggleUmrahSection(frm)
    }
});
frappe.ui.form.on("Virtual Account", {
	onload: function (frm) {
		function wait(time) {
		        if(getElementByXpath('//div[@data-fieldname="sales_order_no"]') !=null) {
				getElementByXpath('//div[@data-fieldname="sales_order_no"]').addEventListener("mouseenter", ()=>{getElementByXpath('//div[@data-fieldname="sales_order_no"]').style.textDecoration = "underline"; getElementByXpath('//div[@data-fieldname="sales_order_no"]').style.cursor = "pointer";});
				getElementByXpath('//div[@data-fieldname="sales_order_no"]').addEventListener("mouseleave", ()=>{getElementByXpath('//div[@data-fieldname="sales_order_no"]').style.textDecoration = "none"; getElementByXpath('//div[@data-fieldname="sales_order_no"]').style.cursor = "default";});
				getElementByXpath('//div[@data-fieldname="sales_order_no"]').addEventListener("click", ()=>{location.href='/desk#Form/Sales%20Order/'+frm.doc.sales_order_no});
				return;
		        }
		        else {
		            setTimeout(function() {
	        	        wait(time);
		            }, time);
        		}
	    	}
		wait(100)
	}
})

from frappe import _

def get_data():
        return {
                'fieldname': 'sales_order',
		'non_standard_fieldnames': {
                        'Item': 'item_code',
                        'Customer': 'name',
                        'Sales Order': 'name',
                        'Delivery Note': 'name',
                        'Payment Entry': 'name'
                },
		'internal_links': {
			'Item': ['items', 'item_code'],
			'Customer': ['items', 'customer'],
			'Sales Order': ['items', 'against_sales_order'],
			'Delivery Note': ['items', 'against_delivery_note'],
                        'Payment Entry': ['items', 'against_payment_entry'],
			'Sales Invoice': ['items', 'against_sales_order'],
		},
                'transactions': [
			{
				'label': _('Related'),
				'items': ['Item', 'Customer', 'Sales Order', 'Delivery Note', 'Sales Invoice', 'Payment Entry']
			}
                ]
        }



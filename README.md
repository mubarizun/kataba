<div align="center">
    <img src="https://i1.wp.com/kataba.id/wp-content/uploads/2018/10/logo-kataba.png?fit=422%2C422&ssl=1" height="128">
    <h2>Kataba ERPNext Custom Scripts</h2>
</div>

To add new custom script, create new file in "frappe-bench/apps/kataba/kataba/public/js"

Include the file to hooks.py in frappe-bench/apps/kataba/hooks.py
Add this line app_include_js = "assets/kataba/js/[your_script_name].js"

Push updates to github

Run bench build && bench update && bench --site dtt-test.mubarizun.com migrate && bench --site all clear-cache

#### License

MIT

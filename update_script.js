const sheetURL = "https://script.google.com/macros/s/AKfycbyafST_5SK6xObxx-FlJp69KfWJ27XDSWLTv5zaAhEyDIbT_0xm-Go2KNLYayYEZZ0r/exec";

function getRepNameByID(id, reps) {
  let rep = reps.find(r => r.Sales_Rep_ID === id);
  return rep ? rep.Sales_Rep_Name_AR : "غير معروف";
}

function saveUpdates() {
  const table = document.getElementById("clientsTable");
  const rows = [...table.querySelectorAll("tbody tr")];

  const updates = rows.map(row => {
    const Customer_Code = row.cells[0].textContent.trim();
    const Customer_Name_AR = row.cells[1].textContent.trim();
    const Old_Sales_Rep_ID = row.cells[4].textContent.trim();
    const select = row.cells[5].querySelector("select");
    const New_Sales_Rep_ID = select ? select.value : "";
    const Date_Modified = new Date().toLocaleString();
    const Modified_By = "مشرف النظام"; // تقدر تغيّره إذا دخل المستخدم
    const Timestamp = new Date().toISOString();

    return {
      Customer_Code,
      Customer_Name_AR,
      Old_Sales_Rep_ID,
      New_Sales_Rep_ID,
      Date_Modified,
      Modified_By,
      Timestamp
    };
  });

  fetch(sheetURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  })
  .then(res => res.text())
  .then(msg => {
    alert("✅ تم إرسال التعديلات بنجاح");
    console.log("Response:", msg);
  })
  .catch(err => {
    alert("❌ خطأ في إرسال التعديلات");
    console.error("Error:", err);
  });
}

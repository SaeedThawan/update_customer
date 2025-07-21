// ✅ روابط ملفات JSON من GitHub بصيغة raw
const customersURL = "https://raw.githubusercontent.com/SaeedThawan/update_customer/main/customers_main.json";
const repsURL = "https://raw.githubusercontent.com/SaeedThawan/update_customer/main/sales_representatives.json";

// ✅ رابط السكربت الرسمي لحفظ التعديلات في Google Sheets
const sheetURL = "https://script.google.com/macros/s/AKfycbyafST_5SK6xObxx-FlJp69KfWJ27XDSWLTv5zaAhEyDIbT_0xm-Go2KNLYayYEZZ0r/exec";

// 🧮 المتغيرات العامة
let customers = [];
let reps = [];

window.addEventListener("DOMContentLoaded", () => {
  Promise.all([
    fetch(customersURL).then(res => res.json()),
    fetch(repsURL).then(res => res.json())
  ])
  .then(([custData, repsData]) => {
    customers = custData;
    reps = repsData;
    renderTable();
  })
  .catch(err => {
    console.error("❌ خطأ في تحميل البيانات", err);
    alert("⚠️ فشل تحميل البيانات من GitHub");
  });
});

function renderTable() {
  const tbody = document.querySelector("#clientsTable tbody");
  tbody.innerHTML = "";

  customers.forEach(c => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${c.Customer_Code}</td>
      <td>${c.Customer_Name_AR}</td>
      <td>${c.City}</td>
      <td>${c.Region}</td>
      <td>${getRepName(c.Current_Sales_Rep_ID)}</td>
      <td>${getRepSelect(c.Current_Sales_Rep_ID)}</td>
      <td>${formatStatus(c.Customer_Status)}</td>
    `;

    tbody.appendChild(row);
  });
}

function getRepName(id) {
  const rep = reps.find(r => r.Sales_Rep_ID === id);
  return rep ? rep.Sales_Rep_Name_AR : "—";
}

function getRepSelect(selectedID) {
  return `<select>
    ${reps.map(rep => `
      <option value="${rep.Sales_Rep_ID}" ${rep.Sales_Rep_ID === selectedID ? "selected" : ""}>
        ${rep.Sales_Rep_Name_AR}
      </option>
    `).join("")}
  </select>`;
}

function formatStatus(status) {
  if (status === "نشط") return `<span style="color:green;font-weight:bold;">نشط</span>`;
  if (status === "غير نشط" || status === "مقفل") return `<span style="color:red;">${status}</span>`;
  return `<span style="color:gray;">—</span>`;
}

function saveUpdates() {
  const rows = document.querySelectorAll("#clientsTable tbody tr");
  const updates = [];

  rows.forEach(row => {
    const Customer_Code = row.cells[0].textContent.trim();
    const Customer_Name_AR = row.cells[1].textContent.trim();
    const Old_Sales_Rep_ID = customers.find(c => c.Customer_Code === Customer_Code)?.Current_Sales_Rep_ID || "";
    const New_Sales_Rep_ID = row.cells[5].querySelector("select").value;
    const Date_Modified = new Date().toLocaleString();
    const Modified_By = "مشرف النظام"; // عدّل لاحقًا حسب الدخول
    const Timestamp = new Date().toISOString();

    updates.push({
      Customer_Code,
      Customer_Name_AR,
      Old_Sales_Rep_ID,
      New_Sales_Rep_ID,
      Date_Modified,
      Modified_By,
      Timestamp
    });
  });

  fetch(sheetURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  })
  .then(res => res.text())
  .then(msg => {
    alert(msg.includes("✅") ? "✅ تم حفظ التعديلات" : "⚠️ تحقق من رسالة النظام:\n" + msg);
    console.log("رد السكربت:", msg);
  })
  .catch(err => {
    console.error("❌ خطأ في الاتصال بالسكربت", err);
    alert("❌ فشل إرسال البيانات، تحقق من الاتصال أو السكربت");
  });
}

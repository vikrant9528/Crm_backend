const cron = require("node-cron");
const Lead = require("../models/Lead");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

cron.schedule("0 18 * * *", async () => {
  console.log("📩 Running daily reminder email job");

  const today = new Date();
  today.setHours(0,0,0,0);

  const missedLeads = await Lead.find({
    followUp: { $gte: today },
    call_track: 0
  }).populate("assignedTo");

  if (!missedLeads.length) return;

  // Group by employee
  const employeeMap = {};

  missedLeads.forEach(lead => {
    const emp = lead.assignedTo?._id?.toString();
    if (!employeeMap[emp]) employeeMap[emp] = [];
    employeeMap[emp].push(lead);
  });

  // Send employee-wise emails
  for (const empId in employeeMap) {
    const employee = await User.findById(empId);

    if (!employee || !employee.email) continue;

    const leadsList = employeeMap[empId]
      .map(l => `${l.name} - ${l.phone}`)
      .join("<br>");

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: employee.email,
      subject: "⚠️ Missed Leads Today - Reminder",
      html: `
        <h3>Hello ${employee.name},</h3>
        <p>You missed these follow-ups today:</p>
        <p>${leadsList}</p>
        <p>🕒 Please follow up ASAP!</p>
      `
    });
  }

  // Admin mail with full list
  const admin = await User.findOne({ role: "admin" });
  
  const adminList = missedLeads
    .map(l => `${l.name} - ${l.phone} / ${l.assignedTo?.name}`)
    .join("<br>");

  await transporter.sendMail({
    from: process.env.EMAIL,
    to: admin.email,
    subject: "📊 All Missed Leads Today",
    html: `<p>${adminList}</p>`
  });

  console.log("✅ Emails sent successfully!");
});

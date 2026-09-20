import { BrevoClient } from "@getbrevo/brevo";

// Shared Brevo client — previously each controller (userController,
// adminController, etc.) would have needed its own separate instantiation
// and duplicated HTML template if it wanted to send email. Centralizing
// this here means any controller can send a notification without
// repeating the setup.
const brevo = process.env.BREVO_API_KEY
  ? new BrevoClient({ apiKey: process.env.BREVO_API_KEY })
  : null;

if (!brevo) {
  console.warn(
    "Email service disabled: add BREVO_API_KEY to backend/.env to send emails.",
  );
}

export const sendTransactionalEmail = async (message) => {
  if (!brevo) {
    throw new Error("Email service is not configured (missing BREVO_API_KEY)");
  }

  return brevo.transactionalEmails.sendTransacEmail(message);
};

const buildCancellationEmailHtml = ({
  patientName,
  doctorName,
  slotDate,
  slotTime,
  cancelledBy,
}) => `
<div style="font-family:Arial;background:#f4f4f4;padding:30px;">
  <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:12px;">
    <h2 style="color:#111;">Appointment Cancelled</h2>
    <p style="color:#555;font-size:15px;">Hi ${patientName || "there"},</p>
    <p style="color:#555;font-size:15px;">
      Your appointment with <strong>Dr. ${doctorName}</strong> on
      <strong>${slotDate}</strong> at <strong>${slotTime}</strong> has been
      cancelled by ${cancelledBy}.
    </p>
    <p style="color:#555;font-size:15px;">
      We're sorry for the inconvenience. You're welcome to book a new
      appointment at your convenience through MindAI.
    </p>
    <p style="font-size:12px;color:gray;margin-top:20px;">
      If you believe this was a mistake, please reach out to our support team.
    </p>
  </div>
</div>
`;

// Sends a cancellation notice to the patient. Deliberately never throws —
// a failed email should never block or roll back the actual cancellation,
// which is a database operation that should succeed independently of
// whether the notification email goes out. Failures are logged, not
// surfaced to the caller.
export const sendAppointmentCancelledEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  slotDate,
  slotTime,
  cancelledBy = "the clinic",
}) => {
  if (!patientEmail) {
    console.log("Skipped cancellation email: no patient email on record");
    return;
  }
  try {
    await sendTransactionalEmail({
      sender: { name: "MindAI", email: "umerbangash5528@gmail.com" },
      to: [{ email: patientEmail }],
      subject: "Your MindAI Appointment Has Been Cancelled",
      htmlContent: buildCancellationEmailHtml({
        patientName,
        doctorName,
        slotDate,
        slotTime,
        cancelledBy,
      }),
    });
    console.log(`Cancellation email sent to: ${patientEmail}`);
  } catch (error) {
    console.error("Failed to send cancellation email:", error);
  }
};

const buildRescheduleEmailHtml = ({
  patientName,
  doctorName,
  oldSlotDate,
  oldSlotTime,
  newSlotDate,
  newSlotTime,
}) => `
<div style="font-family:Arial;background:#f4f4f4;padding:30px;">
  <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:12px;">
    <h2 style="color:#111;">Appointment Rescheduled</h2>
    <p style="color:#555;font-size:15px;">Hi ${patientName || "there"},</p>
    <p style="color:#555;font-size:15px;">
      Your appointment with <strong>Dr. ${doctorName}</strong> has been moved:
    </p>
    <p style="color:#999;font-size:14px;text-decoration:line-through;margin:10px 0 2px;">
      ${oldSlotDate}, ${oldSlotTime}
    </p>
    <p style="color:#111;font-size:16px;font-weight:bold;margin:2px 0 15px;">
      ${newSlotDate}, ${newSlotTime}
    </p>
    <p style="color:#555;font-size:15px;">
      No action is needed from you — this is just a confirmation of the new time.
    </p>
  </div>
</div>
`;

export const sendAppointmentRescheduledEmail = async ({
  patientEmail,
  patientName,
  doctorName,
  oldSlotDate,
  oldSlotTime,
  newSlotDate,
  newSlotTime,
}) => {
  if (!patientEmail) {
    console.log("Skipped reschedule email: no patient email on record");
    return;
  }
  try {
    await sendTransactionalEmail({
      sender: { name: "MindAI", email: "umerbangash5528@gmail.com" },
      to: [{ email: patientEmail }],
      subject: "Your MindAI Appointment Has Been Rescheduled",
      htmlContent: buildRescheduleEmailHtml({
        patientName,
        doctorName,
        oldSlotDate,
        oldSlotTime,
        newSlotDate,
        newSlotTime,
      }),
    });
    console.log(`Reschedule email sent to: ${patientEmail}`);
  } catch (error) {
    console.error("Failed to send reschedule email:", error);
  }
};

export default brevo;

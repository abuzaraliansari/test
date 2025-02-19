const { sql, poolPromise } = require("../config/db");

const getComplaintReplies = async (req, res) => {
  const { complaintno } = req.body;

  if (!complaintno) {
    return res.status(400).json({ success: false, message: "complaintno must be provided" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("complaintno", sql.Int, complaintno)
      .query(
        `SELECT 
          [ReplySno],
          [Attachment],
          [Complaintno],
          [ReplyDescription],
          [ReplyDate],
          [IPAddress],
          [IsAdmin]
        FROM tblComplaintsReply 
        WHERE Complaintno = @complaintno
        ORDER BY ReplyDate ASC`
      );

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaint replies:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaint replies", error: err.message });
  }
};

const submitComplaintReply = async (req, res) => {
  const { complaintno, replyDescription, isAdmin, ipAddress, attachment } = req.body;

  if (!complaintno || !replyDescription) {
    return res.status(400).json({ success: false, message: "complaintno and replyDescription must be provided" });
  }

  try {
    const pool = await poolPromise;

    // Insert the new reply
    await pool
      .request()
      .input("complaintno", sql.Int, complaintno)
      .input("attachment", sql.VarChar, attachment)
      .input("replyDescription", sql.VarChar, replyDescription)
      .input("replyDate", sql.DateTime, new Date())
      .input("ipAddress", sql.VarChar, ipAddress)
      .input("isAdmin", sql.Bit, isAdmin)
      .query(
        `INSERT INTO tblComplaintsReply (Complaintno, Attachment, ReplyDescription, ReplyDate, IPAddress, IsAdmin)
        VALUES (@complaintno, @attachment, @replyDescription, @replyDate, @ipAddress, @isAdmin)`
      );

    res.status(201).json({ success: true, message: "Reply submitted successfully" });
  } catch (err) {
    console.error("Error submitting complaint reply:", err.message);
    res.status(500).json({ success: false, message: "Failed to submit complaint reply", error: err.message });
  }
};

module.exports = {
  getComplaintReplies,
  submitComplaintReply,
};
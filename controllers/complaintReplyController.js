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
          [ReplyID],
          [ComplaintID],
          [ReplyDescription],
          [ReplyBy],
          [ReplyDate],
          [CreatedBy],
          [CreatedDate],
          [ModifiedBy],
          [ModifiedDate],
          [IsAdmin]
        FROM ComplaintReplies 
        WHERE ComplaintID = @complaintno
        ORDER BY ReplyDate ASC`
      );

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error("Error fetching complaint replies:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch complaint replies", error: err.message });
  }
};

const submitComplaintReply = async (req, res) => {
  const { complaintno, replyDescription, isAdmin, ipAddress, attachment, userDetails } = req.body;

  if (!complaintno || !replyDescription) {
    return res.status(400).json({ success: false, message: "complaintno and replyDescription must be provided" });
  }

  try {
    const pool = await poolPromise;

    // Insert the new reply
    await pool
      .request()
      .input("complaintno", sql.Int, complaintno)
      .input("replyDescription", sql.Text, replyDescription)
      .input("replyBy", sql.NVarChar, userDetails.username)
      .input("createdBy", sql.VarChar, userDetails.username)
      .input("isAdmin", sql.Bit, isAdmin ? 1 : 0)
      .query(
        `INSERT INTO ComplaintReplies (ComplaintID, ReplyDescription, ReplyBy, CreatedBy, IsAdmin)
        VALUES (@complaintno, @replyDescription, @replyBy, @createdBy, @isAdmin)`
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
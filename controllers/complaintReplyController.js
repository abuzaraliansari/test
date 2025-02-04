const { sql, poolPromise } = require("../config/db");

const getComplaintReplies = async (req, res) => {
  const { Complaintno } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Complaintno", sql.Int, Complaintno)
      .query(
        `SELECT 
          [ReplySno],
          [Complaintno],
          [ReplyDescription],
          [ReplyDate],
          [IPAddress]
        FROM tblComplaintsReply 
        WHERE Complaintno = @Complaintno`
      );

    res.status(200).json(result.recordset);
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch replies", error: err.message });
  }
};


const submitComplaintReply = async (req, res) => {
  const { Complaintno, ReplyDescription, IPAddress } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Complaintno", sql.Int, Complaintno)
      .query(
        `SELECT ISNULL(MAX(ReplySno), 0) + 1 AS NewReplySno 
         FROM tblComplaintsReply 
         WHERE Complaintno = @Complaintno`
      );

    const newReplySno = result.recordset[0].NewReplySno;

    await pool
      .request()
      .input("Complaintno", sql.Int, Complaintno)
      .input("ReplySno", sql.Int, newReplySno)
      .input("ReplyDescription", sql.Text, ReplyDescription)
      .input("IPAddress", sql.VarChar, IPAddress)
      .query(
        `INSERT INTO tblComplaintsReply (Complaintno, ReplySno, ReplyDescription, IPAddress) 
         VALUES (@Complaintno, @ReplySno, @ReplyDescription, @IPAddress)`
      );

    res.status(200).json({ success: true, message: "Reply submitted successfully" });
  } catch (err) {
    console.error('Error submitting reply:', err);
    res.status(500).json({ success: false, message: "Failed to submit reply", error: err.message });
  }
};

module.exports = {
  getComplaintReplies,
  submitComplaintReply,
};
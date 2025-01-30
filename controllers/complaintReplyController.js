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
  const { Complaintno, ReplySno, ReplyDescription, IPAddress } = req.body;

  try {
    const pool = await poolPromise;
    await pool
      .request()
      .input("Complaintno", sql.Int, Complaintno)
      .input("ReplySno", sql.Int, ReplySno)
      .input("ReplyDescription", sql.Text, ReplyDescription)
      .input("IPAddress", sql.VarChar, IPAddress)
      .query(
        `INSERT INTO tblComplaintsReply (Complaintno, ReplySno, ReplyDescription, IPAddress) 
         VALUES (@Complaintno, @ReplySno, @ReplyDescription, @IPAddress)`
      );

    res.status(200).json({ success: true, message: "Reply submitted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit reply", error: err.message });
  }
};

module.exports = {
  getComplaintReplies,
  submitComplaintReply,
};
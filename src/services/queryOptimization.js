// Example of efficient pagination with cursor
async function getMessagesWithCursor(lastId, limit = 20) {
  return await Message.findAll({
    where: {
      id: {
        [Op.lt]: lastId
      }
    },
    order: [['id', 'DESC']],
    limit
  });
}

// Example of efficient counting
async function getApproximateCount() {
  const result = await sequelize.query(`
    SELECT reltuples::bigint AS estimate
    FROM pg_class
    WHERE relname = 'Messages';
  `);
  return result[0][0].estimate;
}

// Efficient search using materialized view
const createMessageSearchView = `
  CREATE MATERIALIZED VIEW message_search_view AS
  SELECT 
    id,
    content,
    to_tsvector('english', content) as search_vector
  FROM "Messages";

  CREATE INDEX idx_message_search 
  ON message_search_view USING gin(search_vector);
`; 
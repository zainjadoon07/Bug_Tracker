const { sequelize, AuditLog } = require('./Models');

async function run() {
  try {
    await sequelize.authenticate();
    const logs = await AuditLog.findAll({
      where: { action_type: 'COMMENT_DELETED' },
      order: [['created_at', 'DESC']]
    });
    console.log(`Found ${logs.length} COMMENT_DELETED audit logs:`);
    logs.forEach(log => {
      console.log({
        log_id: log.log_id,
        action_type: log.action_type,
        details: log.details,
        user_id: log.user_id,
        created_at: log.created_at
      });
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();

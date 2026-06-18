const { Project, Bug } = require('../Models');

exports.getStats = async (req, res) => {
  try {
    const totalProjects = await Project.count();
    const totalBugs = await Bug.count();
    
    const openBugs = await Bug.count({
      where: { status: 'Open' }
    });
    
    const resolvedBugs = await Bug.count({
      where: { status: 'Resolved' }
    });

    const closedBugs = await Bug.count({
      where: { status: 'Closed' }
    });

    const criticalBugs = await Bug.count({
      where: { priority: 'Critical' }
    });

    // We can also count by other status and priority levels for charting/dashboard visualization!
    const bugsByStatus = {
      Open: await Bug.count({ where: { status: 'Open' } }),
      Assigned: await Bug.count({ where: { status: 'Assigned' } }),
      InProgress: await Bug.count({ where: { status: 'In Progress' } }),
      Testing: await Bug.count({ where: { status: 'Testing' } }),
      Resolved: await Bug.count({ where: { status: 'Resolved' } }),
      Closed: await Bug.count({ where: { status: 'Closed' } })
    };

    const bugsByPriority = {
      Low: await Bug.count({ where: { priority: 'Low' } }),
      Medium: await Bug.count({ where: { priority: 'Medium' } }),
      High: await Bug.count({ where: { priority: 'High' } }),
      Critical: await Bug.count({ where: { priority: 'Critical' } })
    };

    res.json({
      totalProjects,
      totalBugs,
      openBugs,
      resolvedBugs,
      closedBugs,
      criticalBugs,
      bugsByStatus,
      bugsByPriority
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error retrieving dashboard statistics' });
  }
};

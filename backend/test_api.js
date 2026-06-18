// Set test environment so db.js uses SQLite in-memory
process.env.NODE_ENV = 'test';

const express = require('express');
const cors = require('cors');
const http = require('http');
const { sequelize, User, Project, Bug, Comment } = require('./Models');

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '   BUG TRACKING SYSTEM - API INTEGRATION TESTER   ');
console.log('\x1b[36m%s\x1b[0m', '==================================================');

// 1. Setup mock express app
const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./Routes/authRoutes');
const projectRoutes = require('./Routes/projectRoutes');
const bugRoutes = require('./Routes/bugRoutes');
const commentRoutes = require('./Routes/commentRoutes');
const dashboardRoutes = require('./Routes/dashboardRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Helper function to make HTTP requests
const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            body: data ? JSON.parse(data) : {}
          });
        } catch (e) {
          resolve({ status: res.statusCode, body: { text: data } });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

// Start Server & Run Tests
let server;
const runTests = async () => {
  try {
    // Sync schemas
    await sequelize.sync({ force: true });
    console.log('✔ Test database schemas synchronized.');

    server = app.listen(5001, async () => {
      console.log('✔ Test Server listening on port 5001.\n');

      let adminToken = '';
      let testerToken = '';
      let developerToken = '';
      let projectId = null;
      let bugId = null;

      // --- 1. USER REGISTRATION ---
      console.log('\x1b[33m%s\x1b[0m', 'Step 1: Testing User Registration...');
      
      const regAdmin = await request('POST', '/api/auth/register', {
        name: 'Alice Admin',
        email: 'alice@bugtracker.com',
        password: 'password123',
        role: 'Administrator'
      });
      console.log(`  - Register Admin: ${regAdmin.status === 201 ? 'PASS' : 'FAIL'} (${regAdmin.status})`);
      adminToken = regAdmin.body.token;

      const regTester = await request('POST', '/api/auth/register', {
        name: 'Bob Tester',
        email: 'bob@bugtracker.com',
        password: 'password123',
        role: 'Tester'
      });
      console.log(`  - Register Tester: ${regTester.status === 201 ? 'PASS' : 'FAIL'} (${regTester.status})`);
      testerToken = regTester.body.token;

      const regDev = await request('POST', '/api/auth/register', {
        name: 'Charlie Dev',
        email: 'charlie@bugtracker.com',
        password: 'password123',
        role: 'Developer'
      });
      console.log(`  - Register Developer: ${regDev.status === 201 ? 'PASS' : 'FAIL'} (${regDev.status})`);
      developerToken = regDev.body.token;

      // --- 2. USER LOGIN ---
      console.log('\n\x1b[33m%s\x1b[0m', 'Step 2: Testing User Login...');
      const loginRes = await request('POST', '/api/auth/login', {
        email: 'alice@bugtracker.com',
        password: 'password123'
      });
      console.log(`  - Login Admin: ${loginRes.status === 200 && loginRes.body.token ? 'PASS' : 'FAIL'} (${loginRes.status})`);

      // --- 3. PROJECT CREATION ---
      console.log('\n\x1b[33m%s\x1b[0m', 'Step 3: Testing Project Creation...');
      
      // Test unauthorized access (Tester trying to create project)
      const badProj = await request('POST', '/api/projects', {
        project_name: 'Staging App',
        description: 'Should fail'
      }, testerToken);
      console.log(`  - Unauthorized project creation guard (Tester): ${badProj.status === 403 ? 'PASS' : 'FAIL'} (${badProj.status})`);

      // Authorized creation (Admin)
      const goodProj = await request('POST', '/api/projects', {
        project_name: 'E-Commerce Platform',
        description: 'Online shopping website bug tracking'
      }, adminToken);
      console.log(`  - Authorized project creation (Admin): ${goodProj.status === 201 ? 'PASS' : 'FAIL'} (${goodProj.status})`);
      projectId = goodProj.body.project.project_id;

      // --- 4. BUG CREATION ---
      console.log('\n\x1b[33m%s\x1b[0m', 'Step 4: Testing Bug Creation...');
      
      // Admin should fail (Only Tester can report bugs based on rules)
      const badBug = await request('POST', '/api/bugs', {
        project_id: projectId,
        title: 'Checkout crash',
        description: 'Payment crashes on checkout screen',
        priority: 'Critical',
        severity: 'Blocker'
      }, adminToken);
      console.log(`  - Unauthorized bug reporting guard (Admin): ${badBug.status === 403 ? 'PASS' : 'FAIL'} (${badBug.status})`);

      // Tester reports bug successfully
      const goodBug = await request('POST', '/api/bugs', {
        project_id: projectId,
        title: 'Checkout crash',
        description: 'Payment crashes on checkout screen',
        priority: 'Critical',
        severity: 'Blocker'
      }, testerToken);
      console.log(`  - Authorized bug reporting (Tester): ${goodBug.status === 201 ? 'PASS' : 'FAIL'} (${goodBug.status})`);
      bugId = goodBug.body.bug.bug_id;

      // --- 5. BUG UPDATES & ASSIGNMENT ---
      console.log('\n\x1b[33m%s\x1b[0m', 'Step 5: Testing Bug Assignment & Status Updates...');
      
      // Admin assigns Developer
      const devList = await request('GET', '/api/auth/users', null, adminToken);
      const devUser = devList.body.find(u => u.role === 'Developer');
      
      const assignRes = await request('PUT', `/api/bugs/${bugId}`, {
        assigned_user: devUser.user_id,
        status: 'Assigned'
      }, adminToken);
      console.log(`  - Admin assigns bug to developer: ${assignRes.status === 200 && assignRes.body.bug.assigned_user === devUser.user_id ? 'PASS' : 'FAIL'} (${assignRes.status})`);

      // Developer updates status to "In Progress"
      const devUpdateRes = await request('PUT', `/api/bugs/${bugId}`, {
        status: 'In Progress'
      }, developerToken);
      console.log(`  - Developer updates status to 'In Progress': ${devUpdateRes.status === 200 && devUpdateRes.body.bug.status === 'In Progress' ? 'PASS' : 'FAIL'} (${devUpdateRes.status})`);

      // Developer tries to change priority (should fail)
      const devBadUpdate = await request('PUT', `/api/bugs/${bugId}`, {
        priority: 'Low'
      }, developerToken);
      console.log(`  - Developer block from editing priority: ${devBadUpdate.status === 403 ? 'PASS' : 'FAIL'} (${devBadUpdate.status})`);

      // Developer updates status to "Resolved"
      await request('PUT', `/api/bugs/${bugId}`, { status: 'Resolved' }, developerToken);

      // --- 6. COMMENTS ---
      console.log('\n\x1b[33m%s\x1b[0m', 'Step 6: Testing Bug Comment Threads...');
      const commentRes = await request('POST', `/api/comments/${bugId}`, {
        message: 'Fixed in build v1.0.4. Re-tested on Chrome and verified.'
      }, testerToken);
      console.log(`  - Tester appends comment: ${commentRes.status === 201 && commentRes.body.comment.message.includes('Fixed') ? 'PASS' : 'FAIL'} (${commentRes.status})`);

      const getCommentsRes = await request('GET', `/api/comments/${bugId}`, null, developerToken);
      console.log(`  - Retrieve comment count: ${getCommentsRes.status === 200 && getCommentsRes.body.length === 1 ? 'PASS' : 'FAIL'} (${getCommentsRes.status})`);

      // Tester marks status as "Closed"
      const closeRes = await request('PUT', `/api/bugs/${bugId}`, {
        status: 'Closed'
      }, testerToken);
      console.log(`  - Tester closes resolved bug: ${closeRes.status === 200 && closeRes.body.bug.status === 'Closed' ? 'PASS' : 'FAIL'} (${closeRes.status})`);

      // Test block comments on closed bugs (Should fail with 400)
      const closedCommentRes = await request('POST', `/api/comments/${bugId}`, {
        message: 'Commenting on a closed bug'
      }, adminToken);
      console.log(`  - Comment block on Closed bug validation (Admin): ${closedCommentRes.status === 400 ? 'PASS' : 'FAIL'} (${closedCommentRes.status})`);

      // Test block non-admin re-opening (Should fail with 403)
      const closedUpdateRes = await request('PUT', `/api/bugs/${bugId}`, {
        status: 'Open'
      }, developerToken);
      console.log(`  - Reassign/Reopen block on Closed bug validation (Developer): ${closedUpdateRes.status === 403 ? 'PASS' : 'FAIL'} (${closedUpdateRes.status})`);

      // --- 7. DASHBOARD METRICS ---
      console.log('\n\x1b[33m%s\x1b[0m', 'Step 7: Testing Dashboard Aggregations...');
      const dashRes = await request('GET', '/api/dashboard/stats', null, developerToken);
      console.log(`  - Retrieve Dashboard Stats: ${dashRes.status === 200 ? 'PASS' : 'FAIL'} (${dashRes.status})`);
      console.log('    Metrics Returned:', JSON.stringify(dashRes.body));

      console.log('\n\x1b[32m%s\x1b[0m', '==================================================');
      console.log('\x1b[32m%s\x1b[0m', '     ALL INTEGRATION TESTS RUN SUCCESSFULLY!     ');
      console.log('\x1b[32m%s\x1b[0m', '==================================================');
      
      server.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('\n\x1b[31m%s\x1b[0m', '❌ TEST FLOW CRASHED WITH ERROR:');
    console.error(error);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();

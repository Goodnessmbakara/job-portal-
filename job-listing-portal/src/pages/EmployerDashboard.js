import React, { useState, useEffect } from 'react';
import '../styles/EmployerDashboard.css'; // Add styles for the dashboard
import axios from 'axios';
import useSocket from '../hooks/useSocket'; // Custom hook to handle socket.io

const EmployerDashboard = () => {
  const [postedJobs, setPostedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    location: '',
    salary: ''
  });
  const [companyProfile, setCompanyProfile] = useState({
    name: '',
    website: '',
    description: ''
  });
  const [newApplicationNotification, setNewApplicationNotification] = useState(null); // State for real-time notifications
  const [updatingProfile, setUpdatingProfile] = useState(false); // Loading state for profile updates

  // Connect to the real-time notifications using the custom Socket.IO hook
  // useSocket(null, (notification) => {
  //   // Handle real-time new application notifications
  //   setNewApplicationNotification(notification);
  //   // Optionally, you can fetch the latest applications here or update the state accordingly
  // });

  useEffect(() => {
    // Fetch the jobs posted by the employer
    axios.get('/api/employer/posted-jobs')
      .then(response => setPostedJobs(response.data))
      .catch(error => console.error('Error fetching posted jobs:', error));

    // Fetch applications for the posted jobs
    axios.get('/api/employer/applications')
      .then(response => setApplications(response.data))
      .catch(error => console.error('Error fetching applications:', error));

    // Fetch company profile details
    axios.get('/api/employer/company-profile')
      .then(response => setCompanyProfile(response.data))
      .catch(error => console.error('Error fetching company profile:', error));
  }, []);

  const handlePostJob = (e) => {
    e.preventDefault();
    // Logic to post a new job
    axios.post('/api/employer/post-job', newJob)
      .then(response => {
        alert('Job posted successfully!');
        setPostedJobs([...postedJobs, response.data]);
        setNewJob({ title: '', description: '', location: '', salary: '' }); // Reset the form
      })
      .catch(error => console.error('Error posting job:', error));
  };

  const handleCompanyProfileUpdate = (e) => {
    e.preventDefault();
    setUpdatingProfile(true); // Set loading state
    // Logic to update company profile
    axios.post('/api/employer/update-company-profile', companyProfile)
      .then(() => {
        alert('Company profile updated successfully!');
        setUpdatingProfile(false);
      })
      .catch(error => {
        console.error('Error updating company profile:', error);
        setUpdatingProfile(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewJob({ ...newJob, [name]: value });
  };

  return (
    <div className="employer-dashboard">
      <h1>Welcome to Your Employer Dashboard</h1>

      {/* Display Real-Time Notification */}
      {newApplicationNotification && (
        <div className="notification">
          <p><strong>New Application Received:</strong> {newApplicationNotification.message}</p>
        </div>
      )}

      {/* Company Profile */}
      <section className="company-profile">
        <h2>Update Company Profile</h2>
        <form onSubmit={handleCompanyProfileUpdate}>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              value={companyProfile.name}
              onChange={(e) => setCompanyProfile({ ...companyProfile, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              value={companyProfile.website}
              onChange={(e) => setCompanyProfile({ ...companyProfile, website: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Company Description</label>
            <textarea
              value={companyProfile.description}
              onChange={(e) => setCompanyProfile({ ...companyProfile, description: e.target.value })}
            ></textarea>
          </div>
          <button type="submit" className="btn-update" disabled={updatingProfile}>
            {updatingProfile ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </section>

      {/* Post New Job */}
      <section className="post-job">
        <h2>Post a New Job</h2>
        <form onSubmit={handlePostJob}>
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="title"
              value={newJob.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newJob.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={newJob.location}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Salary</label>
            <input
              type="text"
              name="salary"
              value={newJob.salary}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit" className="btn-post-job">Post Job</button>
        </form>
      </section>

      {/* Posted Jobs */}
      <section className="posted-jobs">
        <h2>Your Posted Jobs</h2>
        {postedJobs.length > 0 ? (
          <ul>
            {postedJobs.map(job => (
              <li key={job.id}>
                <div className="job-title">{job.title}</div>
                <div className="job-details">{job.location} - {job.salary}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p>You have not posted any jobs yet.</p>
        )}
      </section>

      {/* Applications */}
      <section className="job-applications">
        <h2>Job Applications</h2>
        {applications.length > 0 ? (
          <ul>
            {applications.map(application => (
              <li key={application.id}>
                <div className="application-info">
                  <div className="job-title">{application.jobTitle}</div>
                  <div className="applicant-name">{application.applicantName}</div>
                  <div className="application-status">Status: {application.status}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No applications received yet.</p>
        )}
      </section>
    </div>
  );
};

export default EmployerDashboard;

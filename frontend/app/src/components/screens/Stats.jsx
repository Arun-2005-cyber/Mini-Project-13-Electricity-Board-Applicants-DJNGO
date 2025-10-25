import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import API_URL from "../../config";
import Loader from "../Loader";
import Message from "../Message";

function Stats() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [chartData, setChartData] = useState({ labels: [], total_requests: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const canvasRef = useRef(null);
  const canvasRef2 = useRef(null);
  const chartRef = useRef(null);
  const chartRef2 = useRef(null);

  // Fetch data whenever filter changes
  useEffect(() => {
    fetchData(selectedStatus);
  }, [selectedStatus]);

  const fetchData = async (status) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const encodedStatus = encodeURIComponent(status || '');
      const url = `${API_URL}/api/connectionrequestdata/?status=${encodedStatus}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const data = await response.json();
      const labels = Array.isArray(data.labels) ? data.labels : [];
      const total_requests = Array.isArray(data.total_requests) ? data.total_requests : [];

      setChartData({ labels, total_requests });

      if (labels.length > 0) setSuccess(true);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("⚠️ Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Create charts after chartData updates
  useEffect(() => {
    if (chartData.labels.length === 0) return;

    const ctx = canvasRef.current?.getContext('2d');
    const ctx2 = canvasRef2.current?.getContext('2d');
    if (!ctx || !ctx2) return;

    // Destroy old charts before drawing new ones
    if (chartRef.current) chartRef.current.destroy();
    if (chartRef2.current) chartRef2.current.destroy();

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: "Requests per Month",
          data: chartData.total_requests,
          backgroundColor: 'rgba(54,162,235,0.7)',
          borderColor: 'rgba(54,162,235,1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { beginAtZero: true } }
      }
    });

    chartRef2.current = new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: "Requests Distribution",
          data: chartData.total_requests,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#66FF66', '#C9CBCF',
          ],
          borderColor: 'white',
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Cleanup on component unmount
    return () => {
      if (chartRef.current) chartRef.current.destroy();
      if (chartRef2.current) chartRef2.current.destroy();
    };
  }, [chartData]);

  const handleStatusChange = (event) => setSelectedStatus(event.target.value);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="container m-5 p-5 card chart" style={{ background: "#2b2b2b" }}>
      <div className="row">
        {/* Go Back Button */}
        <div className="col-md-3">
          <Link to='/' className='btn btn-primary my-1'>Go Back</Link>
        </div>

        {/* Heading */}
        <div className="col-md-12">
          <h5 style={{ color: "#fff" }}>
            Number of connection requests in every month visualization
          </h5>
        </div>

        {/* Filter Dropdown */}
        <div className="col-md-4">
          <br />
          <label htmlFor="status" className='form-label' style={{ color: "#ddd" }}>
            Filter by Connection status
          </label>
          <select
            className='form-select'
            id="status"
            onChange={handleStatusChange}
            value={selectedStatus}
          >
            <option value="">All</option>
            <option value="Connection Released">Connection Released</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Loader / Messages */}
        <div className="col-md-12 mt-3">
          {loading && <Loader />}
          {error && <Message variant="danger">{error}</Message>}
          {success && !loading && !error && (
            <Message variant="success">✅ Data loaded successfully!</Message>
          )}
        </div>

        {/* Charts */}
        {!loading && !error && chartData.labels.length > 0 && (
          <>
            <div className="col-md-6 mt-4" style={{ height: 350 }}>
              <canvas ref={canvasRef}></canvas>
            </div>
            <div className="col-md-6 mt-4" style={{ height: 350 }}>
              <canvas ref={canvasRef2}></canvas>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Stats;

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'chart.js/auto';
import API_URL from "../../config";
import Loader from "../Loader";
import Message from "../Message";

function Stats() {
  const [selectedStatus, setSelectedStatus] = useState(''); // '' means All
  const [chartData, setChartData] = useState({ labels: [], total_requests: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const canvasRef2 = useRef(null);
  const chartRef2 = useRef(null);

  useEffect(() => {
    // fetch whenever selectedStatus changes
    fetchData(selectedStatus);
    // cleanup: destroy charts on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      if (chartRef2.current) {
        chartRef2.current.destroy();
        chartRef2.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  const fetchData = async (status) => {
    setLoading(true);
    setError("");
    try {
      // encode the status for safe URL usage
      const encodedStatus = encodeURIComponent(status || '');
      // include the param only if non-empty (the backend accepts empty too)
      const url = `${API_URL}/api/connectionrequestdata/?status=${encodedStatus}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();

      // Ensure arrays exist
      const labels = (data.labels && Array.isArray(data.labels)) ? data.labels : [];
      const total_requests = (data.total_requests && Array.isArray(data.total_requests)) ? data.total_requests : [];

      setChartData({ labels, total_requests });

      // If existing charts exist, destroy before recreating (avoid duplicates)
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      if (chartRef2.current) {
        chartRef2.current.destroy();
        chartRef2.current = null;
      }

      if (labels.length === 0) {
        // nothing to display — clear canvases (Chart won't be created)
        setLoading(false);
        return;
      }

      // create charts
      createCharts({ labels, total_requests });

    } catch (err) {
      console.error("Error fetching data", err);
      setError("⚠️ Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const createCharts = (data) => {
    const ctx = canvasRef.current && canvasRef.current.getContext('2d');
    const ctx2 = canvasRef2.current && canvasRef2.current.getContext('2d');

    if (!ctx || !ctx2) return;

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{
          label: "Number of connection requests by month",
          data: data.total_requests,
          backgroundColor: 'rgba(54,162,235,0.6)',
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
        labels: data.labels,
        datasets: [{
          label: "Number of connection requests by month",
          data: data.total_requests,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#66FF66', '#C9CBCF'
          ],
          borderColor: 'white',
          borderWidth: 1
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  };

  const handleStatusChange = (event) => {
    setSelectedStatus(event.target.value || '');
  };

  return (
    <div className="container m-5 p-5 card chart" style={{ background: "#2b2b2b" }}>
      <div className="row">
        <div className="col-md-3">
          <Link to='/' className='btn btn-primary my-1'>Go Back</Link>
        </div>

        <div className="col-md-12">
          <h5 style={{ color: "#fff" }}>Number of connection requests in every month visualization</h5>
        </div>

        <div className="col-md-4">
          <br />
          <label htmlFor="status" className='form-label' style={{ color: "#ddd" }}>Filter by Connection status</label>
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

        <div className="col-md-12 mt-3">
          {loading && <Loader />}
          {error && <Message variant="danger">{error}</Message>}
        </div>

        {!loading && !error && chartData.labels.length === 0 && (
          <div className="col-md-12 mt-4">
            <Message variant="info">No data available for the selected status.</Message>
          </div>
        )}

        {!loading && !error && chartData.labels.length > 0 && (
          <>
            <div className="col-md-6 mt-4" style={{ height: 320 }}>
              <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
            </div>
            <div className="col-md-6 mt-4" style={{ height: 320 }}>
              <canvas ref={canvasRef2} style={{ width: '100%', height: '100%' }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Stats;

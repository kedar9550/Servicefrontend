import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import API from '../api/axios';
import { toast } from 'react-toastify';

const Feedback = ({ ticket, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [satisfaction, setSatisfaction] = useState('');
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const satisfactionLevels = [
        "Very Satisfied",
        "Satisfied",
        "Neutral",
        "Dissatisfied",
        "Very Dissatisfied"
    ];

    const handleSubmit = async () => {
        if (rating === 0) {
            return toast.warning("Please provide a star rating");
        }
        if (!satisfaction) {
            return toast.warning("Please select a satisfaction level");
        }

        setSubmitting(true);
        try {
            await API.post('/api/complaints/feedback', {
                ticketId: ticket._id,
                rating,
                satisfaction,
                comments
            }, { withCredentials: true });

            toast.success("Thank you for your feedback!");
            if (onSuccess) onSuccess(ticket._id);
            onClose();
        } catch (err) {
            console.error("Feedback error:", err);
            toast.error(err.response?.data?.message || "Failed to submit feedback");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="feedback-overlay">
            <div className="feedback-modal position-relative">
                <button
                    onClick={onClose}
                    className="position-absolute top-0 end-0 m-3 btn btn-link text-secondary p-0"
                    style={{ zIndex: 1 }}
                >
                    <X size={24} />
                </button>

                <div className="mb-4 pb-3 border-bottom">
                    <h5 className="fw-bold mb-1" style={{ color: 'var(--primary-color)' }}>Share Your Feedback</h5>
                    <p className="text-secondary small mb-0">
                        Ticket: <span className="fw-bold text-dark">{ticket.ticketNumber}</span> - {ticket.title}
                    </p>
                </div>

                <div className="mb-4">
                    <h6 className="fw-bold small mb-2">1. How would you rate your overall experience?</h6>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`star ${star <= (hover || rating) ? 'active' : ''}`}
                                fill={star <= (hover || rating) ? '#ffc107' : 'none'}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <p className="text-secondary smaller mt-1">Click on a star to rate</p>
                </div>

                <div className="mb-4">
                    <h6 className="fw-bold small mb-2">2. How satisfied are you with our service?</h6>
                    <div className="satisfaction-options">
                        {satisfactionLevels.map((level) => (
                            <label key={level} className="satisfaction-option">
                                <input
                                    type="radio"
                                    name="satisfaction"
                                    value={level}
                                    checked={satisfaction === level}
                                    onChange={(e) => setSatisfaction(e.target.value)}
                                />
                                <span className="small">{level}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <h6 className="fw-bold small mb-2">3. Additional Comments</h6>
                    <textarea
                        className="feedback-textarea"
                        placeholder="Write your comments here..."
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        maxLength={500}
                    />
                    <p className="text-end text-secondary smaller mb-0">{comments.length}/500</p>
                </div>

                <div className="feedback-footer">
                    <button
                        className="btn btn-outline-secondary px-4"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary px-4 fw-bold"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Feedback;

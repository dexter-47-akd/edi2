"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import StarRating from "./StarRating";

const supabaseUrl = "https://njejfdmqtnplfnomjyvd.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZWpmZG1xdG5wbGZub21qeXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODczNDIsImV4cCI6MjA3MTI2MzM0Mn0.N2jjDp86bTCnzr8zP-pQlipYzCNpCPrIDndMLGLlBmw";
const supabase = createClient(supabaseUrl, supabaseKey);

type Review = {
  id: string;
  product_id: string;
  user_name: string | null;
  user_email: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
};

type ReviewsModalProps = {
  productId: string;
  productName?: string;
  isOpen: boolean;
  onClose: () => void;
  onAggregates?: (avg: number, count: number) => void;
};

const initialForm = { name: "", email: "", rating: 0, title: "", comment: "" };

const validateForm = (form: typeof initialForm) => {
  const errors: Partial<Record<keyof typeof initialForm, string>> = {};
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.email.trim()) errors.email = "Email is required";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email";
  if (!form.rating || form.rating < 1 || form.rating > 5) errors.rating = "Select 1-5 stars";
  if (!form.title.trim()) errors.title = "Title is required";
  if (!form.comment.trim()) errors.comment = "Comment is required";
  return errors;
};

const ReviewsModal: React.FC<ReviewsModalProps> = ({ productId, productName, isOpen, onClose, onAggregates }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof initialForm, string>>>({});

  const aggregates = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const count = reviews.length;
    return { avg: sum / count, count };
  }, [reviews]);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("reviews")
        .select("id, product_id, user_name, user_email, rating, title, comment, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (!error) setReviews(data as Review[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel(`reviews-${productId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reviews", filter: `product_id=eq.${productId}` },
        (payload) => {
          setReviews((prev) => [payload.new as Review, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, productId]);

  useEffect(() => {
    if (onAggregates) onAggregates(aggregates.avg, aggregates.count);
  }, [aggregates, onAggregates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validateForm(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      product_id: productId,
      user_name: form.name.trim(),
      user_email: form.email.trim().toLowerCase(),
      rating: form.rating,
      title: form.title.trim(),
      comment: form.comment.trim(),
    });
    setSubmitting(false);
    if (!error) {
      setForm(initialForm);
    } else {
      alert(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Customer Reviews
            </h3>
            {productName && (
              <p className="text-gray-600 mt-1">for {productName}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Reviews Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-gray-900">What customers say</h4>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <StarRating value={aggregates.avg} readOnly size="sm" />
                  <span className="text-sm text-gray-600">
                    {aggregates.avg.toFixed(1)} ({aggregates.count} reviews)
                  </span>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-4 rounded w-1/3 mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-1/4 mb-3"></div>
                    <div className="bg-gray-200 h-20 rounded"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h5 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h5>
                <p className="text-gray-600">Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {(r.user_name || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{r.user_name || "Anonymous"}</div>
                          <div className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <StarRating value={Number(r.rating) || 0} readOnly size="sm" />
                      </div>
                    </div>
                    {r.title && (
                      <h6 className="font-semibold text-gray-900 mb-2">{r.title}</h6>
                    )}
                    {r.comment && (
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Review Form */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-6">Write a review</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your name"
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="p-4 bg-white rounded-xl border border-gray-200 flex items-center">
                  <StarRating 
                    value={form.rating} 
                    onChange={(v) => setForm((f) => ({ ...f, rating: v }))} 
                    size="lg"
                  />
                </div>
                {errors.rating && <p className="text-sm text-red-600 mt-1">{errors.rating}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Brief summary of your experience"
                />
                {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your review</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-32 resize-none"
                  placeholder="Share your detailed experience with this product..."
                />
                {errors.comment && <p className="text-sm text-red-600 mt-1">{errors.comment}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsModal;



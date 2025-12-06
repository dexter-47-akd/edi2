"use client";

import { useState } from "react";
import Link from "next/link";
import ChromaGrid from "../ReactBits/ChromaGrid/ChromaGrid";

// About page categories
const aboutCategories = [
  { id: 'team', name: 'Our Team', icon: '👥', color: 'from-blue-600 to-purple-600', description: 'Meet our amazing team members' },
  { id: 'mission', name: 'Our Mission', icon: '🎯', color: 'from-green-500 to-emerald-500', description: 'What drives us forward' },
  { id: 'values', name: 'Our Values', icon: '💎', color: 'from-pink-500 to-rose-500', description: 'Core principles we believe in' },
  { id: 'story', name: 'Our Story', icon: '📖', color: 'from-orange-500 to-amber-500', description: 'How it all began' },
  { id: 'achievements', name: 'Achievements', icon: '🏆', color: 'from-purple-500 to-indigo-500', description: 'Milestones we\'ve reached' },
  { id: 'future', name: 'Future Plans', icon: '🚀', color: 'from-cyan-500 to-blue-500', description: 'Where we\'re heading next' },
];

export default function AboutPage() {
  const [selectedCategory, setSelectedCategory] = useState('team');

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const renderCategoryContent = () => {
    switch (selectedCategory) {
      case 'team':
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Amazing Team</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We're a diverse group of passionate individuals working together to create amazing experiences for our customers.
              </p>
            </div>
                         <ChromaGrid 
               items={[
                 {
                   image: "/ArnavDaruWala.jpeg",
                   title: "Arnav Dholi",
                   subtitle: "Full Stack Developer",
                   handle: "@dexter-akd47",
                   borderColor: "#4F46E5",
                   gradient: "linear-gradient(145deg, #4F46E5, #000)",
                   url: "https://github.com/",
                   title1:"All in one package , has done everything that helped in making of this amzaing website"
                 },
                                   {
                    image: "/WhatsApp Image 2025-08-24 at 10.21.35 PM.jpeg",
                    title: "Alokik Verma",
                    subtitle: "FrontEnd Engineer",
                    handle: "@Toji_Fushiguro",
                    borderColor: "#10B981",
                    gradient: "linear-gradient(210deg, #10B981, #000)",
                    url: "https://linkedin.com/in/",
                    title1: "Frontend wizard who brings beautiful designs to life with pixel-perfect precision"
                  },
                  {
                    image: "/bahvu.jpeg",
                    title: "Bhavesh Konkar",
                    subtitle: "ICPC KING",
                    handle: "@Leetecoder",
                    borderColor: "#EF4444",
                    gradient: "linear-gradient(195deg, #EF4444, #000)",
                    url: "https://kaggle.com/",
                    title1: "Competitive programming champion who solves complex algorithms with lightning speed"
                  },
                  {
                    image: "/rahul.jpeg",
                    title: "Rahul Choudhary",
                    subtitle: "Ai specialist",
                    handle: "@rahul_choudhary30",
                    borderColor: "#06B6D4",
                    gradient: "linear-gradient(135deg, #06B6D4, #000)",
                    url: "https://aws.amazon.com/",
                    title1: "AI expert who creates intelligent solutions that think and learn like humans"
                  },
               ]}
               columns={2}
               rows={2}
               radius={300}
             />
          </div>
        );
      
      case 'mission':
        return (
            
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <video autoPlay loop muted>
                <source src="Animated_Logo_Shopping_Cart_Video.mp4" ></source>
            </video>
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-4xl">🎯</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              To revolutionize the e-commerce experience by providing innovative, user-friendly platforms that connect people with the products they love, while maintaining the highest standards of quality, security, and customer satisfaction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">Constantly pushing boundaries to create better experiences</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Collaboration</h3>
                <p className="text-gray-600">Working together to achieve common goals</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Excellence</h3>
                <p className="text-gray-600">Striving for the highest quality in everything we do</p>
              </div>
            </div>
          </div>
        );
      
      case 'values':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
              <p className="text-lg text-gray-600">The principles that guide every decision we make</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: '🔒', title: 'Integrity', description: 'We operate with complete transparency and honesty in all our dealings.' },
                { icon: '🚀', title: 'Innovation', description: 'We embrace change and continuously seek new ways to improve.' },
                { icon: '👥', title: 'Diversity', description: 'We celebrate different perspectives and inclusive environments.' },
                { icon: '💪', title: 'Resilience', description: 'We adapt and grow stronger through challenges and setbacks.' },
                { icon: '🎯', title: 'Focus', description: 'We maintain clear priorities and deliver on our commitments.' },
                { icon: '❤️', title: 'Empathy', description: 'We understand and care about our customers\' needs and experiences.' },
              ].map((value, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl">{value.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'story':
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <p className="text-lg text-gray-600">From humble beginnings to industry leadership</p>
            </div>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌱</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">The Beginning (2020)</h3>
                  <p className="text-gray-600">Started as a small team of passionate developers with a vision to transform online shopping experiences.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Phase (2021-2022)</h3>
                  <p className="text-gray-600">Expanded our team and launched innovative features that set new industry standards.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌟</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Today (2023-2024)</h3>
                  <p className="text-gray-600">Leading the industry with cutting-edge technology and exceptional customer experiences.</p>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'achievements':
        return (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Achievements</h2>
              <p className="text-lg text-gray-600">Milestones that mark our journey of success</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { number: '1M+', label: 'Happy Customers', icon: '😊' },
                { number: '500+', label: 'Team Members', icon: '👥' },
                { number: '50+', label: 'Countries Served', icon: '🌍' },
                { number: '99.9%', label: 'Uptime', icon: '⚡' },
              ].map((achievement, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">{achievement.icon}</span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{achievement.number}</div>
                  <div className="text-gray-600">{achievement.label}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 p-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Industry Recognition</h3>
              <p className="text-lg opacity-90">
                Winner of "Best E-commerce Platform 2024" and "Innovation Award 2023"
              </p>
            </div>
          </div>
        );
      
      case 'future':
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Future Plans</h2>
              <p className="text-lg text-gray-600">Exciting developments on the horizon</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Shopping</h3>
                    <p className="text-gray-600">Advanced recommendation systems and personalized experiences</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🌐</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Global Expansion</h3>
                    <p className="text-gray-600">Reaching new markets and serving more customers worldwide</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">📱</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Mobile-First Experience</h3>
                    <p className="text-gray-600">Revolutionary mobile app with cutting-edge features</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the story behind our success, meet our amazing team, and learn about our mission to revolutionize e-commerce.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="mb-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {aboutCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`group relative p-4 rounded-xl text-center transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r ' + category.color + ' text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
              >
                <div className="text-2xl mb-2">{category.icon}</div>
                <div className="text-sm font-medium mb-1">{category.name}</div>
                <div className={`text-xs ${
                  selectedCategory === category.id ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {category.description}
                </div>
                {selectedCategory === category.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Content */}
        <div className="min-h-[600px]">
          {renderCategoryContent()}
        </div>
      </div>
    </div>
  );
}

-- Create tables for e-commerce functionality
-- Run this in the Supabase SQL editor

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    items JSONB NOT NULL, -- Array of cart items
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    shipping DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    shipping_address JSONB NOT NULL, -- Shipping address object
    payment_method TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Email notifications table (for storing email data)
CREATE TABLE IF NOT EXISTS public.email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    data JSONB NOT NULL, -- Email template data
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending' -- pending, sent, failed
);

-- Enable RLS for email notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for email notifications (only authenticated users can insert)
CREATE POLICY "Authenticated users can insert email notifications" ON public.email_notifications
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_email_notifications_to_email ON public.email_notifications(to_email);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON public.email_notifications(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON public.orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.email_notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;


-- Product reviews table
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (product_id, user_id)
);

-- Enable RLS for product reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for product reviews
-- Anyone (including anon) can read reviews
CREATE POLICY "Anyone can view product reviews" ON public.product_reviews
    FOR SELECT USING (true);

-- Only the authenticated user can insert their own review
CREATE POLICY "Users can insert their own review" ON public.product_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only the review owner can update their review
CREATE POLICY "Users can update their own review" ON public.product_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Only the review owner can delete their review
CREATE POLICY "Users can delete their own review" ON public.product_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for product reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON public.product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON public.product_reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON public.product_reviews(rating);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_product_reviews_updated_at 
    BEFORE UPDATE ON public.product_reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grants
GRANT SELECT ON public.product_reviews TO anon;
GRANT ALL ON public.product_reviews TO authenticated;


-- Simple reviews table to match frontend ReviewsModal
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title TEXT,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and allow public read and public insert (since modal uses anon key)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- Optional: only owners could update/delete if you later add auth user_id
-- For now, disallow updates/deletes by omitting policies

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

-- Trigger to update updated_at on change
CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON public.reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grants
GRANT SELECT ON public.reviews TO anon;
GRANT INSERT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO authenticated;
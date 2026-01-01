-- Tabla de productos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'plan',
  weight_range_min INTEGER,
  weight_range_max INTEGER,
  duration_days INTEGER,
  is_subscription BOOLEAN DEFAULT false,
  subscription_discount INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de zonas de cobertura
CREATE TABLE public.coverage_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name TEXT NOT NULL,
  zone_type TEXT DEFAULT 'colonia',
  postal_code TEXT,
  is_active BOOLEAN DEFAULT true,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  coverage_zone_id UUID REFERENCES public.coverage_zones(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  order_type TEXT DEFAULT 'single',
  delivery_date TEXT,
  delivery_notes TEXT,
  ai_recommendation JSONB,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de configuración
CREATE TABLE public.app_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de testimonios
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  pet_name TEXT,
  pet_breed TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de lista de espera
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  zone_requested TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coverage_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de lectura para productos, zonas, testimonios
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Coverage zones are viewable by everyone" ON public.coverage_zones FOR SELECT USING (true);
CREATE POLICY "Testimonials are viewable by everyone" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Config is viewable by everyone" ON public.app_config FOR SELECT USING (true);

-- Políticas públicas para crear pedidos y lista de espera (sin auth requerido)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their orders by phone" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Anyone can join waitlist" ON public.waitlist FOR INSERT WITH CHECK (true);

-- Insertar datos demo de productos
INSERT INTO public.products (name, slug, description, short_description, price, original_price, category, weight_range_min, weight_range_max, duration_days, is_subscription, subscription_discount, sort_order) VALUES
('Starter Pack 7 Días', 'starter-pack', 'Perfecto para que tu perro pruebe la dieta BARF. Incluye variedad de proteínas balanceadas para una semana completa de alimentación natural.', 'Prueba la dieta BARF por una semana', 599.00, NULL, 'starter', 5, 15, 7, false, 0, 1),
('Plan Quincenal', 'plan-quincenal', 'Dos semanas de alimentación BARF premium. Ideal para perros medianos que están haciendo la transición a la dieta natural.', '15 días de alimentación natural', 1099.00, 1198.00, 'plan', 10, 25, 15, false, 0, 2),
('Plan Mensual', 'plan-mensual', 'Un mes completo de dieta BARF. La opción más popular para dueños comprometidos con la salud de su mascota.', '30 días de nutrición premium', 1899.00, 2396.00, 'plan', 10, 30, 30, false, 0, 3),
('Suscripción Mensual', 'suscripcion-mensual', 'Recibe tu plan mensual automáticamente cada mes con 10% de descuento. Sin preocupaciones, sin olvidos. Prioridad en entregas.', 'Ahorra 10% cada mes + prioridad', 1709.00, 1899.00, 'subscription', 10, 30, 30, true, 10, 4);

-- Insertar zonas de cobertura demo
INSERT INTO public.coverage_zones (zone_name, zone_type, postal_code, is_active, delivery_fee) VALUES
('Angelópolis', 'colonia', '72830', true, 0),
('La Vista Country Club', 'colonia', '72830', true, 0),
('Lomas de Angelópolis', 'colonia', '72830', true, 0),
('San Andrés Cholula Centro', 'colonia', '72810', true, 0),
('Zavaleta', 'colonia', '72150', true, 0),
('La Paz', 'colonia', '72160', true, 0),
('Juárez', 'colonia', '72000', true, 25),
('Centro Histórico', 'colonia', '72000', true, 25),
('Huexotitla', 'colonia', '72534', true, 0),
('San Manuel', 'colonia', '72570', true, 0);

-- Insertar testimonios demo
INSERT INTO public.testimonials (customer_name, pet_name, pet_breed, content, rating) VALUES
('María González', 'Max', 'Golden Retriever', 'Desde que Max come Raw Paw, su pelaje brilla como nunca. La diferencia en su energía es increíble. ¡Gracias!', 5),
('Carlos Hernández', 'Luna', 'French Bulldog', 'Luna tenía problemas digestivos con las croquetas. Con BARF, todo cambió. Ahora come feliz y sin molestias.', 5),
('Ana Martínez', 'Rocky', 'Labrador', 'La transición fue súper fácil. El equipo de Raw Paw me guió en todo. Rocky está más activo que nunca.', 5);

-- Insertar configuración inicial
INSERT INTO public.app_config (key, value) VALUES
('whatsapp_number', '"5212223334455"'),
('free_shipping_minimum', '1500'),
('whatsapp_api_mode', 'false'),
('business_hours', '{"start": "09:00", "end": "18:00"}');

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_app_config_updated_at BEFORE UPDATE ON public.app_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
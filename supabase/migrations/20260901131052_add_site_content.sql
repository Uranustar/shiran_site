
CREATE TABLE IF NOT EXISTS public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_content TO anon, authenticated;

GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
ON public.site_content
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.site_content (section, content)
VALUES

(
  'hero',
  '{
    "badge": "עמותה לתמיכה במתמודדי נפש",
    "title": "לא תהיו לבד בדרך אל האור",
    "description": "אנחנו כאן בשבילך — ליווי אישי, ייעוץ מקצועי וקהילה חמה, באהבה ובכבוד, ללא תיוג וללא שיפוט.",
    "donateButton": "לתרומה",
    "supportButton": "לקבלת סיוע — *3042"
  }'::jsonb
),

(
  'support_cards',
  '{
    "items": [
      {
        "title": "תמיכה נפשית אישית",
        "desc": "ליווי אישי וקשוב לאורך כל הדרך",
        "tone": "primary",
        "icon": "Brain"
      },
      {
        "title": "ייעוץ מקצועי",
        "desc": "הכוונה ממומחים בריאות הנפש",
        "tone": "leaf",
        "icon": "LifeBuoy"
      },
      {
        "title": "קבוצות תמיכה",
        "desc": "קהילה שמבינה ומלווה",
        "tone": "sun",
        "icon": "Users"
      },
      {
        "title": "קו חירום חם",
        "desc": "*3042 — זמין 24/7, דיסקרטי",
        "tone": "primary",
        "icon": "Heart"
      },
      {
        "title": "ליווי משפחתי",
        "desc": "תמיכה בבני משפחה ובני זוג",
        "tone": "primary",
        "icon": "HandHeart"
      },
      {
        "title": "סדנאות העצמה",
        "desc": "כלים לריפוי וצמיחה",
        "tone": "leaf",
        "icon": "Sparkles"
      }
    ]
  }'::jsonb
),

(
  'services',
  '{
    "items": [
      {
        "title": "ליווי משפחתי",
        "desc": "תמיכה בבני משפחה ובני זוג",
        "icon": "HandHeart"
      },
      {
        "title": "סדנאות העצמה",
        "desc": "כלים לריפוי וצמיחה",
        "icon": "Sparkles"
      },
      {
        "title": "קהילה מקוונת",
        "desc": "שייכות בכל רגע ובכל מקום",
        "icon": "Users"
      },
      {
        "title": "הפניה לטיפול",
        "desc": "גישור לטיפול מקצועי מתאים",
        "icon": "LifeBuoy"
      }
    ]
  }'::jsonb
),

(
  'stats',
  '{
    "items": [
      {
        "value": "+12,000",
        "label": "מתמודדים ומשפחות לוו"
      },
      {
        "value": "24/7",
        "label": "קו חירום חם ודיסקרטי"
      },
      {
        "value": "+450",
        "label": "מתנדבים ומלווים"
      },
      {
        "value": "100%",
        "label": "ללא תיוג וללא שיפוט"
      }
    ]
  }'::jsonb
),

(
  'testimonial',
  '{
    "quote": "כשהגעתי למצמיחים מהלב הרגשתי שלראשונה מישהו באמת שומע אותי. הליווי החזיר לי את התקווה ואת הקול שלי.",
    "author": "נ׳ — בוגרת מסלול ליווי אישי"
  }'::jsonb
)

ON CONFLICT DO NOTHING;
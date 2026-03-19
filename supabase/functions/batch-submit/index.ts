import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BatchReport {
  report_type: string;
  latitude: number;
  longitude: number;
  county_id: string;
  town_name?: string;
  description?: string;
  landmark?: string;
  road_name?: string;
  sub_location?: string;
}

interface BatchMetric {
  county_id: string;
  metric_type: string;
  metric_value: number;
  recorded_at?: string;
  source?: string;
  metadata?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // Authenticate caller
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { type, items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'items must be a non-empty array' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (items.length > 100) {
      return new Response(JSON.stringify({ error: 'Maximum 100 items per batch' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result;

    if (type === 'reports') {
      const reports = (items as BatchReport[]).map(item => ({
        ...item,
        reporter_id: user.id,
        status: 'pending',
      }));

      const { data, error } = await adminClient
        .from('environmental_reports')
        .insert(reports)
        .select('id');

      if (error) throw error;
      result = { inserted: data?.length ?? 0, ids: data?.map(r => r.id) };

    } else if (type === 'metrics') {
      // Verify caller is a county_admin
      const { data: roleRow } = await supabaseAuth
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (roleRow?.role !== 'county_admin') {
        return new Response(JSON.stringify({ error: 'Forbidden: county admin role required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get admin's county
      const { data: profileRow } = await supabaseAuth
        .from('profiles')
        .select('county_id')
        .eq('user_id', user.id)
        .maybeSingle();

      const adminCounty = profileRow?.county_id;

      const metrics = (items as BatchMetric[]).map(item => ({
        ...item,
        county_id: adminCounty || item.county_id, // enforce admin's county
        source: item.source || 'iot_sensor',
        recorded_at: item.recorded_at || new Date().toISOString(),
      }));

      // Verify all metrics are for admin's county
      if (adminCounty && metrics.some(m => m.county_id !== adminCounty)) {
        return new Response(JSON.stringify({ error: 'Can only submit metrics for your own county' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data, error } = await adminClient
        .from('water_metrics_history')
        .insert(metrics)
        .select('id');

      if (error) throw error;
      result = { inserted: data?.length ?? 0 };

    } else {
      return new Response(JSON.stringify({ error: 'type must be "reports" or "metrics"' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log the API call
    const duration = Date.now() - startTime;
    await adminClient.from('api_logs').insert({
      function_name: 'batch-submit',
      status_code: 200,
      duration_ms: duration,
      user_id: user.id,
      request_metadata: { type, item_count: items.length },
    });

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    await adminClient.from('api_logs').insert({
      function_name: 'batch-submit',
      status_code: 500,
      duration_ms: duration,
      error_message: error.message,
      user_id: user.id,
    });

    console.error('Batch submit error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

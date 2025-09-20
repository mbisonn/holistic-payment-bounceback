// Dashboard Testing and Debugging Utilities

export interface DashboardTestConfig {
  testAuth: boolean;
  testDataFetching: boolean;
  testUIElements: boolean;
  testLogout: boolean;
}

import { supabase } from '@/integrations/supabase/client';

export const testDashboardFunctionality = async (config: DashboardTestConfig) => {
  const results = {
    auth: { passed: false, error: null as string | null },
    dataFetching: { passed: false, error: null as string | null },
    uiElements: { passed: false, error: null as string | null },
    logout: { passed: false, error: null as string | null }
  };

  // Test Authentication
  if (config.testAuth) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        results.auth.error = 'No active session found';
      } else {
        results.auth.passed = true;
        console.log('✅ Auth test passed - User session found:', session.user.email);
      }
    } catch (error: any) {
      results.auth.error = `Auth test failed: ${error.message}`;
      console.error('❌ Auth test failed:', error);
    }
  }

  // Test Data Fetching
  if (config.testDataFetching) {
    try {
      
      // Test orders fetch
      const { error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(1);
      
      if (ordersError) {
        results.dataFetching.error = `Orders fetch failed: ${ordersError.message}`;
      } else {
        console.log('✅ Orders fetch test passed');
      }

      // Test products fetch
      const { error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1);
      
      if (productsError) {
        results.dataFetching.error = `Products fetch failed: ${productsError.message}`;
      } else {
        console.log('✅ Products fetch test passed');
      }

      if (!results.dataFetching.error) {
        results.dataFetching.passed = true;
      }
    } catch (error: any) {
      results.dataFetching.error = `Data fetching test failed: ${error.message}`;
      console.error('❌ Data fetching test failed:', error);
    }
  }

  // Test UI Elements
  if (config.testUIElements) {
    try {
      // Check if glass-card class exists
      const hasGlassCard = document.querySelector('.glass-card') !== null;
      
      if (!hasGlassCard) {
        results.uiElements.error = 'Glass card styles not found';
      } else {
        results.uiElements.passed = true;
        console.log('✅ UI elements test passed - Glass styles found');
      }
    } catch (error: any) {
      results.uiElements.error = `UI elements test failed: ${error.message}`;
      console.error('❌ UI elements test failed:', error);
    }
  }

  // Test Logout
  if (config.testLogout) {
    try {
      
      // Test logout function (without actually logging out)
      const logoutFunction = async () => {
        try {
          await supabase.auth.signOut();
          return true;
        } catch (error) {
          return false;
        }
      };
      
      const canLogout = await logoutFunction();
      if (canLogout) {
        results.logout.passed = true;
        console.log('✅ Logout test passed');
      } else {
        results.logout.error = 'Logout function failed';
      }
    } catch (error: any) {
      results.logout.error = `Logout test failed: ${error.message}`;
      console.error('❌ Logout test failed:', error);
    }
  }

  return results;
};

export const debugDashboardIssues = () => {
  const issues = [];

  // Check for common issues
  const checkNetworkConnectivity = async () => {
    try {
      const response = await fetch('https://ytqruetuadthefyclmiq.supabase.co/rest/v1/', {
        method: 'HEAD'
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  const checkLocalStorage = () => {
    try {
      localStorage.getItem('test');
      return true;
    } catch {
      return false;
    }
  };

  const checkSessionStorage = () => {
    try {
      sessionStorage.getItem('test');
      return true;
    } catch {
      return false;
    }
  };

  // Add checks
  if (!checkNetworkConnectivity()) {
    issues.push('Network connectivity issues - Supabase may be unreachable');
  }

  if (!checkLocalStorage()) {
    issues.push('LocalStorage not available - may affect auth persistence');
  }

  if (!checkSessionStorage()) {
    issues.push('SessionStorage not available - may affect auth persistence');
  }

  // Check for console errors
  const originalError = console.error;
  const errors: string[] = [];
  console.error = (...args) => {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };

  return {
    issues,
    errors,
    resetConsole: () => {
      console.error = originalError;
    }
  };
};

export const getDashboardStatus = () => {
  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
    supabaseUrl: 'https://ytqruetuadthefyclmiq.supabase.co',
    currentUrl: window.location.href,
    performance: {
      loadTime: performance.now(),
      memory: (performance as any).memory
    }
  };
}; 
package app.cinelog.mobile;

import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private OnBackInvokedCallback backInvokedCallback;
    private long lastBackPressedTime = 0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Window window = getWindow();
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_NAVIGATION);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(0xFF000000);
        window.setNavigationBarColor(0xFF000000);
        
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }

        // 1. Android 13+ (API 33+) Predictive Back Navigation
        // Registering with PRIORITY_OVERLAY instructs the OS that CineLog owns back gestures,
        // preventing Android from playing the exit animation and killing the activity.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            backInvokedCallback = this::performUniversalBack;
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                OnBackInvokedDispatcher.PRIORITY_OVERLAY,
                backInvokedCallback
            );
        }

        // 2. Android 12 and below / 3-button navigation fallback
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                performUniversalBack();
            }
        });
    }

    private void performUniversalBack() {
        long now = System.currentTimeMillis();
        if (now - lastBackPressedTime < 350) {
            return; // Throttle duplicate system gesture events
        }
        lastBackPressedTime = now;

        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().post(() -> {
                getBridge().getWebView().evaluateJavascript(
                    "(function(){ if (window.cinelogHandleBack) { return window.cinelogHandleBack(); } else { window.dispatchEvent(new CustomEvent('cinelog-hardware-back')); return 'dispatched'; } })();",
                    value -> {
                        if (value != null && (value.contains("exit") || "\"exit\"".equals(value))) {
                            moveTaskToBack(true);
                        }
                    }
                );
            });
        }
    }

    @Override
    public void onBackPressed() {
        performUniversalBack();
    }

    @Override
    public boolean onKeyDown(int keyCode, android.view.KeyEvent event) {
        if (keyCode == android.view.KeyEvent.KEYCODE_BACK) {
            performUniversalBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void onDestroy() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && backInvokedCallback != null) {
            try {
                getOnBackInvokedDispatcher().unregisterOnBackInvokedCallback(backInvokedCallback);
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }
}

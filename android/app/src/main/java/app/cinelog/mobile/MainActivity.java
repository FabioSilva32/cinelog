package app.cinelog.mobile;

import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import androidx.activity.OnBackPressedCallback;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

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

        // Clean unified Android back handler (handles edge gestures and back buttons)
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            private long lastBackPressedTime = 0;

            @Override
            public void handleOnBackPressed() {
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
        });
    }
}

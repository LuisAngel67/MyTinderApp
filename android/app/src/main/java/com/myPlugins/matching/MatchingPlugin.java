package com.myPlugins.matching;

import android.app.Activity;
import android.content.Intent;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "MatchingPlugin")
public class MatchingPlugin extends Plugin {

  private static final int MATCHING_REQUEST = 1234;

  @PluginMethod
  public void openMatching(PluginCall call) {
    Activity activity = getActivity();
    if (activity == null) {
      call.reject("Activity not available");
      return;
    }
    Intent intent = new Intent(activity, MatchingActivity.class);

    String currentUserId = call.getString("userId");
    if (currentUserId != null) {
      intent.putExtra("userId", currentUserId);
    }

    // Guardamos la llamada para que luego pueda ser resuelta en handleOnActivityResult
    saveCall(call);

    startActivityForResult(call, intent, MATCHING_REQUEST);
  }

  @Override
  protected void handleOnActivityResult(int requestCode, int resultCode, Intent data) {
    super.handleOnActivityResult(requestCode, resultCode, data);
    if (requestCode == MATCHING_REQUEST) {
      JSObject ret = new JSObject();
      if (data != null && data.hasExtra("matchedUserId")) {
        ret.put("matchedUserId", data.getStringExtra("matchedUserId"));
      }
      notifyListeners("matchingClosed", ret);
      // Resolver la llamada guardada para que el lado JS que llamó a openMatching reciba la respuesta
      PluginCall savedCall = getSavedCall();
      if (savedCall != null) {
        savedCall.resolve(ret);
      }
    }
  }
}

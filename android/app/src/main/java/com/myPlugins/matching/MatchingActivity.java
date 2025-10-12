package com.myPlugins.matching;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup.LayoutParams;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class MatchingActivity extends AppCompatActivity {

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // UI simple creada programáticamente para evitar añadir layouts XML.
    LinearLayout layout = new LinearLayout(this);
    layout.setOrientation(LinearLayout.VERTICAL);
    layout.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
    int padding = (int) (16 * getResources().getDisplayMetrics().density);
    layout.setPadding(padding, padding, padding, padding);

    TextView tv = new TextView(this);
    tv.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
    tv.setText("Matching screen (simulada). Pulsa 'Match' para devolver un resultado.");
    layout.addView(tv);

    Button matchBtn = new Button(this);
    matchBtn.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
    matchBtn.setText("Match");
    matchBtn.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View v) {
        Intent result = new Intent();
        // Simulamos un user id emparejado
        result.putExtra("matchedUserId", "user_12345");
        setResult(RESULT_OK, result);
        finish();
      }
    });
    layout.addView(matchBtn);

    Button cancelBtn = new Button(this);
    cancelBtn.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
    cancelBtn.setText("Cancel");
    cancelBtn.setOnClickListener(new View.OnClickListener() {
      @Override
      public void onClick(View v) {
        setResult(RESULT_CANCELED);
        finish();
      }
    });
    layout.addView(cancelBtn);

    setContentView(layout);
  }
}


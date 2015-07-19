/*************************************************** 

 ****************************************************/

#include "Adafruit_TLC5947.h"

// How many boards do you have chained?
#define NUM_TLC5974 1
#define num_keys 24

#define data   51
#define clock   52
#define latch   25
#define oe  -1  // set to -1 to not use the enable pin (its optional)

#define LED_dim_value   250   // make this greater than 0. If you make it zero, the first pass through the main loop won't set the TLC properly. But you can change that if you need.
#define LED_bright_value   4095

Adafruit_TLC5947 tlc = Adafruit_TLC5947(NUM_TLC5974, clock, data, latch);

int pin_config[48][2] = {
  { 1 , 28 },
  { 2 , 30 },
  { 3 , 32 },
  { 4 , 34 },
  { 5 , 36 },
  { 6 , 38 },
  { 7 , 40 },
  { 8 , 42 },
  { 9 , A0 },
  { 10 , A1 },
  { 11 , A2 },
  { 12 , A3 },
  { 13 , A4 },
  { 14 , A5 },
  { 15 , A6 },
  { 16 , A7 },
  { 17 , A8 },
  { 18 , A9 },
  { 19 , A10 },
  { 20 , A11 },
  { 21 , A12 },
  { 22 , A13 },
  { 23 , A14 },
  { 24 , A15 },
  { 25 , 12 },
  { 26 , 13 },
  { 27 , 11 },
  { 28 , 10 },
  { 29 , 9 },
  { 30 , 8 },
  { 31 , 7 },
  { 32 , 6 },
  { 33 , 23 },
  { 34 , 22 },
  { 35 , 24 },
  { 36 , 26 },
  { 37 , 5 },
  { 38 , 4 },
  { 39 , 3 },
  { 40 , 2 },
  { 41 , 14 },
  { 42 , 15 },
  { 43 , 16 },
  { 44 , 17 },
  { 45 , 18 },
  { 46 , 19 },
  { 47 , 20 },
  { 48 , 21 },
  };
  
  char char_config[24][2] = {
  { 1 , 'A' },
  { 2 , 'B' },
  { 3 , 'C' },
  { 4 , 'D' },
  { 5 , 'E' },
  { 6 , 'F' },
  { 7 , 'G' },
  { 8 , 'H' },
  { 9 , '1' },
  { 10 , '1' },
  { 11 , '1' },
  { 12 , '1' },
  { 13 , '1' },
  { 14 , '1' },
  { 15 , '1' },
  { 16 , '1' },
  { 17 , '1' },
  { 18 , '1' },
  { 19 , '1' },
  { 20 , '1' },
  { 21 , '1' },
  { 22 , '1' },
  { 23 , '1' },
  { 24 , '1' },
  };
  
 int button_state[num_keys];
 int light_state[num_keys];
 int change_detected;
 int button_low_thresh;
 int button_high_thresh;
 int button_state_low_limit;
 int button_state_high_limit;
 
void setup() {
  Serial.begin(115200);

  Serial.println("TLC5974 test");
  tlc.begin();
  if (oe >= 0) {
    pinMode(oe, OUTPUT);
    digitalWrite(oe, LOW);
  }

  for(int n = 0; n < 47; n++){
    pinMode(pin_config[n][1], INPUT);
  }

  for(int n = 0; n < num_keys-1; n++){
    button_state[n] = 0;
  }
  for(int n = 0; n < num_keys-1; n++){
    light_state[n] = 0;  // Start off at zero. Will go up to LED_dim_value momentarily
  }
  change_detected=0;
  
  
  button_low_thresh=2;
  button_high_thresh=18;
  button_state_low_limit=0;
  button_state_high_limit=19;
  

/*
  button_low_thresh=20;
  button_high_thresh=40;
  button_state_low_limit=0;
  button_state_high_limit=50;
  */
}

void loop() {

  for(int n = 0; n < num_keys; n++){      //****  Read all buttons and enter into button_state array
    if(!digitalRead(pin_config[n][1])){
      button_state[n]++;
    }
    else{
      button_state[n]--;
    }
    if(button_state[n] < button_state_low_limit) button_state[n] = button_state_low_limit;
    if(button_state[n] > button_state_high_limit) button_state[n] = button_state_high_limit;
    //if(button_state[n] < 0) button_state[n] = 0;
    //if(button_state[n] > 10) button_state[n] = 10;
  }
  
  for(int n = 0; n < num_keys; n++){        //****  write button state to PWM buffer
    if(button_state[n] > button_high_thresh && light_state[n] != LED_bright_value){
      tlc.setPWM(n, LED_bright_value);
      light_state[n]=LED_bright_value;
      Serial.print("Set high ");
      Serial.print(n);
      change_detected=1;
            Serial.print(", button_state is ");
      Serial.println(button_state[n]);
    }
    else if(button_state[n] <=button_low_thresh && light_state[n] != LED_dim_value)
      {
      tlc.setPWM(n, LED_dim_value);
      light_state[n]=LED_dim_value;
      Serial.print("Set low ");
      Serial.print(n);

      change_detected=1;
            Serial.print(", button_state is ");
      Serial.println(button_state[n]);
    }

  }
  
  if(change_detected)
  {
  tlc.write();   // Write everything to the TLC chip
  Serial.println("Writing to TLC");
  change_detected=0;
  }
  
  delay(0);




/*  
  

   tlc.setPWM(0, 4095);
   tlc.write();
   delay(500);
    tlc.setPWM(0, 3000);
   tlc.write();
   delay(500);
    tlc.setPWM(0, 2000);
   tlc.write();
   delay(500);  
   */
/*
   tlc.setPWM(0, 0);
   tlc.write();
   delay(1000);

  for(int n = 0; n < 409; n++){
    digitalWrite(7, digitalRead(7)^1);
    
    for(int i = 0; i < 24; i++){
      tlc.setPWM(i, n*10);
    }
    tlc.write();
    }
    */
  
  /*
  for(int i = 0; i < 4096; i++){
      tlc.setPWM(0, 4096);
      tlc.write();
      delay(1000);
    }
    */
}


#include <Arduino.h>
#include "MotorHandler.h"

#define SRATE 115200

// used for serial communication
char inputchars[10];
int charcount;
float newx, newy;
int sign;
boolean started;
boolean zdown;

void setup(){
	
	Serial.begin(SRATE);
	started = false;
	zdown = false;
	initMotors();
	//wait for host application to connect
	while(!Serial.available())
	{
		if((millis()/1000)%2)
		{
			digitalWrite(13, HIGH);
		}
		else
		{
			digitalWrite(13, LOW);
		}
	}
	if(Serial.peek() == '#')
	{
		Serial.read();
		Serial.write('@');
	}
	
}

void loop() {
	
	// wait for data to come
	while(Serial.available() < 1);
	
	// the char '#' is a comm check. reply with '@'
	// start if the char 'S' is sent, finish if 'T' is sent
	if(Serial.peek() == '#')
	{
		Serial.read();
		Serial.write('@');
	}
	else
	if(Serial.peek() == 'S')
	{
		// drawing started
		started = true;
		zdown = false;
		Serial.read(); 
                Serial.write('@');
	}
	else
	if(Serial.peek() == 'T')
	{
		// drawing finished
		started = false;
		Serial.read();
		if(zdown)
		{
			penUp();
			zdown = false;
		}
		drawLine(0.0, 0.0);
		resetPositions();
		release();
	}else
	if(Serial.peek() == 'A')
	{
		// raise pen
		Serial.read();
		if(zdown)
		{
			penUp();
			zdown = false;
		}
		Serial.write('@');
	}else
	if(Serial.peek() == 'Z')
	{
		// lower pen
		Serial.read();
		if(!zdown)
		{
			penDown();
			zdown = true;
		}
		Serial.write('@');
	}else
	if(started)
	{
		// if there is some serial data, read it, parse it, use it
		boolean complete = false;
		char tmpchar;
		if (Serial.available() > 0)
		{
			charcount = 0;
			complete = false;
			newx = 0;
			sign = 1;
			while(!complete)
			{
				// wait for x data
				while(Serial.available() < 1);
				tmpchar = Serial.read();
				if(tmpchar == '.')
				{
					// signals end of number
					complete = true;
					continue;
				}
				if(tmpchar == '-')
				{
					sign = -1;
				}
				else
				{
					newx = newx*10.0 + tmpchar-'0';
				}
				charcount++;
			}
			newx = newx*sign/10000.0;
			while(Serial.available() > 0)
			{
				Serial.read(); // clear the port
			}
			//char dig = (char)(((int)'0')+charcount);
			Serial.write('@'); // write a verification byte
		}
		
		// wait for the y data
		while(Serial.available() < 1);
		if (Serial.available() > 0)
		{
			charcount = 0;
			complete = false;
			newy = 0;
			sign = 1;
			while(!complete)
			{
				while(Serial.available() < 1)
				{
					delay(1);
				}
				tmpchar = Serial.read();
				if(tmpchar == '.')
				{
					complete = true;
					continue;
				}
				if(tmpchar == '-')
				{
					sign = -1;
				}
				else
				{
					newy = newy*10.0 + tmpchar-'0';
				}
				charcount++;
			}
			newy = newy*sign/10000.0;
			while(Serial.available() > 0)
			{
				Serial.read(); // clear the port
			}
			//char dig = (char)(((int)'0')+charcount);
			/*Serial.write('@'); // send verification byte*/
		}
		// now we have newx and newy.
		drawLine(newx, newy);
                while(Serial.available() > 0)
		{
			Serial.read(); // clear the port
		}
		//char dig = (char)(((int)'0')+charcount);
		Serial.write('%'); // send verification byte
	}
	else
	{
		// it was some unexpected transmission
		// clear it
		Serial.read();
	}
}


#include <Arduino.h>
#include "AFMotor.h"
#include "Servo.h"

/************************************************************************/
/* Motor's calibration                                                                     */
/************************************************************************/
const int speed_motor_x = 150;
const int speed_motor_y = 70;
//const float stepSize[2] = {0.26, 0.145}; // mm per step [x, y]
const float stepSize[2] = { 0.154, 0.258}; // mm per step [x, y]

/************************************************************************/
/* Pins where the motors are plugged in                                                                     */
/************************************************************************/
const int pins_z[2] = {2, 3};

/************************************************************************/
/* Motors initialization                                                              */
/************************************************************************/

// Connect a stepper motor with 48 steps per revolution (7.5 degree)
// to motor port #1 (M1 and M2)
//AF_Stepper motor_x(48, 2);
//AF_Stepper motor_y(24, 1);
AF_Stepper motor_x(24, 2);
AF_Stepper motor_y(48, 1);
/*
* Z axis, handle with a micro servo.
* servo1.attach(10) for initialization.
*/
Servo motor_z;

// the current position
float posmm[2];
int poss[2];

// if it is touching the limits
volatile boolean xlimit, ylimit;

// used by the drawing function
int xSteps, ySteps;
int xdir, ydir;
float slope;
int dx, dy;
int z_steps = 1;

void initMotors(){
	
	pinMode(pins_z[0], OUTPUT);
	pinMode(pins_z[1], OUTPUT);
	
	motor_x.setSpeed(speed_motor_x);
	motor_y.setSpeed(speed_motor_y);
	
	// initialize the numbers
	posmm[0] = 0.0;
	posmm[1] = 0.0;
	poss[0] = 0;
	poss[1] = 0;
	
	motor_z.attach(10);
	motor_z.write(90);
}

void resetPositions(){
	posmm[0] = 0.0;
	posmm[1] = 0.0;
	poss[0] = 0;
	poss[1] = 0;
}

void release(){
	motor_x.release();
	motor_y.release();
}

void oneStep(int m, int dir){
	// make one step with motor number m in direction dir
	if(dir > 0){
		poss[m]++;
		posmm[m] += stepSize[m];
		if(m == 0)
		motor_x.step(1, FORWARD, INTERLEAVE);
		if(m == 1)
		motor_y.step(1, FORWARD, INTERLEAVE);
	}
	else
	{
		poss[m]--;
		posmm[m] -= stepSize[m];
		if(m == 0)
		motor_x.step(1, BACKWARD, INTERLEAVE);
		if(m == 1)
		motor_y.step(1, BACKWARD, INTERLEAVE);
	}

}

/*
* moves the pen in a straight line from the current position
* to the point (x2, y2)
*/
void drawLine(float x2, float y2)
{
	// determine the direction and number of steps
	xdir = 1;
	if(x2-posmm[0] < 0 ) xdir = -1;
	xSteps = int((x2-posmm[0])/stepSize[0] + 0.5*xdir);
	ydir = 1;
	if(y2-posmm[1] < 0) ydir = -1;
	ySteps = int((y2-posmm[1])/stepSize[1] + 0.5*ydir);
	if(xSteps*xdir > 0)
	{
		slope = ySteps*1.0/(1.0*xSteps)*ydir*xdir;
	}else
	{
		slope = 9999;
	}
	dx = 0;
	dy = 0;

	if(xSteps*xdir > ySteps*ydir)
	{
		while(dx < xSteps*xdir)
		{
			if(xlimit || ylimit)
			{
				// we hit a limit. back off the switch, and return
				oneStep(0, -xdir);
				oneStep(0, -xdir);
				oneStep(1, -ydir);
				oneStep(1, -ydir);
				return;
			}
			// move one x step at a time
			dx++;
			oneStep(0, xdir);
			// if needed, move y one step
			if(ySteps*ydir > 0 && slope*dx > dy+0.5)
			{
				dy++;
				oneStep(1, ydir);
			}
		}
	}
	else
	{
		while(dy < ySteps*ydir)
		{
			if(xlimit || ylimit)
			{
				// we hit a limit. back off the switch, and return
				oneStep(0, -xdir);
				oneStep(0, -xdir);
				oneStep(1, -ydir);
				oneStep(1, -ydir);
				return;
			}
			// move one y step at a time
			dy++;
			oneStep(1, ydir);
			// if needed, move x one step
			if(xSteps*xdir > 0 && dy > slope*(dx+0.5))
			{
				dx++;
				oneStep(0, xdir);
			}
		}
	}
	// at this point we have drawn the line
}

void penDown()
{
	motor_z.write(30);
}

void penUp()
{
        release();
	motor_z.write(90);
}

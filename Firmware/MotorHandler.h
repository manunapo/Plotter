/*
 * MotorHandler.h
 *
 * Created: 23/06/2014 22:31:49
 *  Author: manuelescritorio
 */ 

#ifndef MOTORHANDLER_H_
#define MOTORHANDLER_H_


void initMotors();

void resetPositions();

void release();

/*
* moves the pen in a straight line from the current position
* to the point (x2, y2)
*/
void drawLine(float x2, float y2);

void penUp();

void penDown();

#endif /* MOTORHANDLER_H_ */

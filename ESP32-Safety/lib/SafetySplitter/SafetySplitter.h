#include <Arduino.h>

#ifndef SafetySplitter_h
#define SafetySplitter_h


class SafetySplitter {
public:

	SafetySplitter();
	String split(String data, char separator, int index);

private:

};

#endif

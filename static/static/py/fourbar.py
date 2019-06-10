from math import pi, cos, sin, sqrt, acos
 
radian = 180/pi
degree = pi/180

#PLAP
def plap(ax, ay, ac, bac, bx, by, pos):
    if pos == 0:
        cx= ac*cos(bac - acos((ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 + abs(ax - bx)**2 - abs(ay - by)**2)/(2*sqrt(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2)*abs(ax - bx)))) + ax 
        cy= ac*sin(bac - acos((ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 + abs(ax - bx)**2 - abs(ay - by)**2)/(2*sqrt(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2)*abs(ax - bx)))) + ay
    else:
        cx= ac*cos(bac + acos((ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 + abs(ax - bx)**2 - abs(ay - by)**2)/(2*sqrt(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2)*abs(ax - bx)))) + ax 
        cy= ac*sin(bac + acos((ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 + abs(ax - bx)**2 - abs(ay - by)**2)/(2*sqrt(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2)*abs(ax - bx)))) + ay
    return cx, cy
    
#PLLP
def pllp(ax, ay, ac, cb, bx, by, pos):
    if pos == 0:
        cx =  -((ay - by)*(-ac**2*ay + ac**2*by + ax**2*ay + ax**2*by - 2*ax*ay*bx - 2*ax*bx*by + ay**3 - ay**2*by + ay*bx**2 - ay*by**2 + ay*cb**2 + bx**2*by + by**3 - by*cb**2 - sqrt((-ac**2 + 2*ac*cb + ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 - cb**2)*(ac**2 + 2*ac*cb - ax**2 + 2*ax*bx - ay**2 + 2*ay*by - bx**2 - by**2 + cb**2))*(ax - bx)) + (ac**2 - ax**2 - ay**2 + bx**2 + by**2 - cb**2)*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))/(2*(ax - bx)*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))
        cy =  (-ac**2*ay + ac**2*by + ax**2*ay + ax**2*by - 2*ax*ay*bx - 2*ax*bx*by + ay**3 - ay**2*by + ay*bx**2 - ay*by**2 + ay*cb**2 + bx**2*by + by**3 - by*cb**2 + sqrt((-ac**2 + 2*ac*cb + ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 - cb**2)*(ac**2 + 2*ac*cb - ax**2 + 2*ax*bx - ay**2 + 2*ay*by - bx**2 - by**2 + cb**2))*(-ax + bx))/(2*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))
    else:
        cx =  -((ay - by)*(-ac**2*ay + ac**2*by + ax**2*ay + ax**2*by - 2*ax*ay*bx - 2*ax*bx*by + ay**3 - ay**2*by + ay*bx**2 - ay*by**2 + ay*cb**2 + bx**2*by + by**3 - by*cb**2 + sqrt((-ac**2 + 2*ac*cb + ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 - cb**2)*(ac**2 + 2*ac*cb - ax**2 + 2*ax*bx - ay**2 + 2*ay*by - bx**2 - by**2 + cb**2))*(ax - bx)) + (ac**2 - ax**2 - ay**2 + bx**2 + by**2 - cb**2)*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))/(2*(ax - bx)*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))
        cy =  (-ac**2*ay + ac**2*by + ax**2*ay + ax**2*by - 2*ax*ay*bx - 2*ax*bx*by + ay**3 - ay**2*by + ay*bx**2 - ay*by**2 + ay*cb**2 + bx**2*by + by**3 - by*cb**2 + sqrt((-ac**2 + 2*ac*cb + ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2 - cb**2)*(ac**2 + 2*ac*cb - ax**2 + 2*ax*bx - ay**2 + 2*ay*by - bx**2 - by**2 + cb**2))*(ax - bx))/(2*(ax**2 - 2*ax*bx + ay**2 - 2*ay*by + bx**2 + by**2))
    return cx, cy
    
class fourbar(object):

    '''
    (ax, ay) motor coord
    (bx, by) rocker base coord
    bac motor angle
    ac link1 length
    cd link2 length
    db link3 length
    ce triangle side1
    ed triangle side2
    '''
    def __init__(self, ax, ay, bx, by, bac, ac, cd, db, ce, ed):

        self.ax = ax
        self.ay = ay
        self.bx = bx
        self.by = by
        self.bac = bac
        self.ac = ac
        self.cd = cd
        self.db = db
        self.ce = ce
        self.ed = ed
        
    @property
    def cx(self):
        return plap(self.ax, self.ay, self.ac, self.bac, self.bx, self.by, pos=0)[0]

    @property
    def cy(self):
        return plap(self.ax, self.ay, self.ac, self.bac, self.bx, self.by, pos=0)[1]

    @property
    def dx(self):
        return pllp(self.cx, self.cy, self.cd, self.db, self.bx, self.by, pos=0)[0]

    @property
    def dy(self):
        return pllp(self.cx, self.cy, self.cd, self.db, self.bx, self.by, pos=0)[1]
        
    @property
    def ex(self):
        return pllp(self.cx, self.cy, self.ce, self.ed, self.dx, self.dy, pos=0)[0]

    @property
    def ey(self):
        return pllp(self.cx, self.cy, self.ce, self.ed, self.dx, self.dy, pos=0)[1]

'''    
# 利用 fourbar 物件建立案例
f = fourbar(ax = -60, ay = 0, bx = 0, by = 0, bac = 50*degree, ac = 30, cd = 50, db = 60, ce = 50, ed = 50)

# 利用 fourbar 物件案例的方法求各點座標
#f.cx, f.cy 為 C 點座標
#f.dx, f.dy 為 D 點座標
#f.ex, f.ey 為 E 點座標
'''

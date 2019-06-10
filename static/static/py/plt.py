import math

class Coord(object):
    def __init__(self,x,y):
        self.x = x
        self.y = y

    def __sub__(self,other):
        # This allows you to substract vectors
        return Coord(self.x-other.x,self.y-other.y)

    def __repr__(self):
        # Used to get human readable coordinates when printing
        return "Coord(%f,%f)"%(self.x,self.y)

    def length(self):
        # Returns the length of the vector
        return math.sqrt(self.x**2 + self.y**2)

    def angle(self):
        # Returns the vector's angle
        return math.atan2(self.y,self.x)

def normalize(coord):
    return Coord(
        coord.x/coord.length(),
        coord.y/coord.length()
        )

def perpendicular(coord):
    # Shifts the angle by pi/2 and calculate the coordinates
    # using the original vector length
    return Coord(
        coord.length()*math.cos(coord.angle()+math.pi/2),
        coord.length()*math.sin(coord.angle()+math.pi/2)
        )

# 點類別
class Point(object):
    # 起始方法
    def __init__(self, x, y):
        self.x = x
        self.y = y

    # 繪製方法
    def drawMe(self, g, r):
        self.g = g
        self.r = r
        self.g.save()
        self.g.moveTo(self.x,self.y)
        self.g.beginPath()
        # 根據 r 半徑繪製一個圓代表點的所在位置
        self.g.arc(self.x, self.y, self.r, 0, 2*math.pi, True)
        self.g.moveTo(self.x,self.y)
        self.g.lineTo(self.x+self.r, self.y)
        self.g.moveTo(self.x, self.y)
        self.g.lineTo(self.x-self.r, self.y)
        self.g.moveTo(self.x, self.y)
        self.g.lineTo(self.x, self.y+self.r)
        self.g.moveTo(self.x, self.y)
        self.g.lineTo(self.x, self.y-self.r)
        self.g.restore()
        self.g.stroke()

    # 加入 Eq 方法
    def Eq(self, pt):
        self.x = pt.x
        self.y = pt.y

    # 加入 setPoint 方法
    def setPoint(self, px, py):
        self.x = px
        self.y = py

    # 加上 distance(pt) 方法, 計算點到 pt 的距離
    def distance(self, pt):
        self.pt = pt
        x = self.x - self.pt.x
        y = self.y - self.pt.y
        return math.sqrt(x * x + y * y)

    # 利用文字標示點的座標位置
    def tag(self, g):
        self.g = g
        self.g.beginPath()
        self.g.fillText("%d, %d"%(self.x, self.y),self.x, self.y)
        self.g.stroke()


# Line 類別物件
class Line(object):

    # 起始方法
    def __init__(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        # 直線的第一點, 設為線尾
        self.Tail = self.p1
        # 直線組成的第二點, 設為線頭
        self.Head = self.p2
        # 直線的長度屬性
        self.length = math.sqrt(math.pow(self.p2.x-self.p1.x, 2)+math.pow(self.p2.y-self.p1.y,2))

    # setPP 以指定頭尾座標點來定義直線
    def setPP(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        self.Tail = self.p1
        self.Head = self.p2
        self.length = math.sqrt(math.pow(self.p2.x-self.p1.x, 2)+math.pow(self.p2.y-self.p1.y,2))

    # setRT 方法 for Line, 應該已經確定 Tail 點, 然後以 r, t 作為設定 Head 的參考
    def setRT(self, r, t):
        self.r = r
        self.t = t
        x = self.r * math.cos(self.t)
        y = self.r * math.sin(self.t)
        self.Tail.Eq(self.p1)
        self.Head.setPoint(self.Tail.x + x,self.Tail.y + y)

    # getR 方法 for Line
    def getR(self):
        # x 分量與 y 分量
        x = self.p1.x - self.p2.x
        y = self.p1.y - self.p2.y
        return math.sqrt(x * x + y * y)

    # 根據定義 atan2(y,x), 表示 (x,y) 與 正 x 軸之間的夾角, 介於 pi 與 -pi 間
    def getT(self):
        x = self.p2.x - self.p1.x
        y = self.p2.y - self.p1.y
        if (math.fabs(x) < math.pow(10,-100)):
            if(y < 0.0):
                return (-math.pi/2)
            else:
                return (math.pi/2)
        else:
            return math.atan2(y, x)

    # setTail 方法 for Line
    def setTail(self, pt):
        self.pt = pt
        self.Tail.Eq(pt)
        self.Head.setPoint(self.pt.x + self.x, self.pt.y + self.y)

    # getHead 方法 for Line
    def getHead(self):
        return self.Head

    def getTail(self):
        return self.Tail

    def drawMe(self, g):
        self.g = g
        self.g.beginPath()
        self.g.moveTo(self.p1.x,self.p1.y)
        self.g.lineTo(self.p2.x,self.p2.y)
        self.g.stroke()

    def test(self):
        return ("this is pure test to Inherit")


class Link(Line):
    def __init__(self, p1, p2):
        self.p1 = p1
        self.p2 = p2
        self.length = math.sqrt(math.pow((self.p2.x - self.p1.x), 2) + math.pow((self.p2.y - self.p1.y), 2))

    #g context
    def drawMe(self, g):
        self.g = g
        hole = 5
        radius = 10
        length = self.getR()
        # alert(length)
        # 儲存先前的繪圖狀態
        self.g.save()
        self.g.translate(self.p1.x,self.p1.y)
        #alert(str(self.p1.x)+","+str(self.p1.y))
        #self.g.rotate(-((math.pi/2)-self.getT()))
        self.g.rotate(-math.pi*0.5 + self.getT())
        #alert(str(self.getT()))
        #self.g.rotate(10*math.pi/180)
        #this.g.rotate(-(Math.PI/2-this.getT()));
        # 必須配合畫在 y 軸上的 Link, 進行座標轉換, 也可以改為畫在 x 軸上...
        self.g.beginPath()
        self.g.moveTo(0,0)
        self.g.arc(0, 0, hole, 0, 2*math.pi, True)
        self.g.stroke()
        self.g.moveTo(0,length)
        self.g.beginPath()
        self.g.arc(0,length, hole, 0, 2*math.pi, True)
        self.g.stroke()
        self.g.moveTo(0,0)
        self.g.beginPath()
        self.g.arc(0,0, radius, 0, math.pi, True)
        self.g.moveTo(0+radius,0)
        self.g.lineTo(0+radius,0+length)
        self.g.stroke()
        self.g.moveTo(0,0+length)
        self.g.beginPath()
        self.g.arc(0, 0+length, radius, math.pi, 0, True)
        self.g.moveTo(0-radius,0+length)
        self.g.lineTo(0-radius,0)
        self.g.stroke()
        self.g.restore()
        '''
        self.g.beginPath()
        self.g.fillStyle = "red"
        self.g.font = "bold 18px sans-serif"
        self.g.fillText("%d, %d"%(self.p2.x, self.p2.y),self.p2.x, self.p2.y)
        self.g.stroke()
        '''


class Triangle(object):
    def __init__(self, p1, p2, p3):
        self.p1 = p1
        self.p2 = p2
        self.p3 = p3

    def getLenp3(self):
        p1 = self.p1
        ret = p1.distance(self.p2)
        return ret

    def getLenp1(self):
        p2 = self.p2
        ret = p2.distance(self.p3)
        return ret

    def getLenp2(self):
        p1 = self.p1
        ret = p1.distance(self.p3)
        return ret

    # 角度
    def getAp1(self):
        ret = math.acos(((self.getLenp2() * self.getLenp2() + self.getLenp3() * self.getLenp3()) - self.getLenp1() * self.getLenp1()) / (2* self.getLenp2() * self.getLenp3()))
        return ret

    #
    def getAp2(self):
        ret =math.acos(((self.getLenp1() * self.getLenp1() + self.getLenp3() * self.getLenp3()) - self.getLenp2() * self.getLenp2()) / (2* self.getLenp1() * self.getLenp3()))
        return ret

    def getAp3(self):
        ret = math.acos(((self.getLenp1() * self.getLenp1() + self.getLenp2() * self.getLenp2()) - self.getLenp3() * self.getLenp3()) / (2* self.getLenp1() * self.getLenp2()))
        return ret

    def drawMe(self, g):
        self.g = g
        r = 5
        # 繪出三個頂點
        self.p1.drawMe(self.g,r)
        self.p2.drawMe(self.g,r)
        self.p3.drawMe(self.g,r)
        line1 = Line(self.p1,self.p2)
        line2 = Line(self.p1,self.p3)
        line3 = Line(self.p2,self.p3)
        # 繪出三邊線
        line1.drawMe(self.g)
        line2.drawMe(self.g)
        line3.drawMe(self.g)

    # ends Triangle def
    # 透過三個邊長定義三角形
    def setSSS(self, lenp3, lenp1, lenp2):
        self.lenp3 = lenp3
        self.lenp1 = lenp1
        self.lenp2 = lenp2
        self.ap1 = math.acos(((self.lenp2 * self.lenp2 + self.lenp3 * self.lenp3) - self.lenp1 * self.lenp1) / (2* self.lenp2 * self.lenp3))
        self.ap2 = math.acos(((self.lenp1 * self.lenp1 + self.lenp3 * self.lenp3) - self.lenp2 * self.lenp2) / (2* self.lenp1 * self.lenp3))
        self.ap3 = math.acos(((self.lenp1 * self.lenp1 + self.lenp2 * self.lenp2) - self.lenp3 * self.lenp3) / (2* self.lenp1 * self.lenp2))

    # 透過兩個邊長與夾角定義三角形
    def setSAS(self, lenp3, ap2, lenp1):
        self.lenp3 = lenp3
        self.ap2 = ap2
        self.lenp1 = lenp1
        self.lenp2 = math.sqrt((self.lenp3 * self.lenp3 + self.lenp1 * self.lenp1) - 2* self.lenp3 * self.lenp1 * math.cos(self.ap2))
        #等於 SSS(AB, BC, CA)

    def setSaSS(self, lenp2, lenp3, lenp1):
        self.lenp2 = lenp2
        self.lenp3 = lenp3
        self.lenp1 = lenp1
        if(self.lenp1 > (self.lenp2 + self.lenp3)):
        #<CAB 夾角為 180 度, 三點共線且 A 介於 BC 之間
            ret = math.pi
        else :
            # <CAB 夾角為 0, 三點共線且 A 不在 BC 之間
            if((self.lenp1 < (self.lenp2 - self.lenp3)) or (self.lenp1 < (self.lenp3 - self.lenp2))):
                ret = 0.0
            else :
            # 透過餘絃定理求出夾角 <CAB 
                ret = math.acos(((self.lenp2 * self.lenp2 + self.lenp3 * self.lenp3) - self.lenp1 * self.lenp1) / (2 * self.lenp2 * self.lenp3))
        return ret

    # 取得三角形的三個邊長值
    def getSSS(self):
        temp = []
        temp.append( self.getLenp1() )
        temp.append( self.getLenp2() )
        temp.append( self.getLenp3() )
        return temp

    # 取得三角形的三個角度值
    def getAAA(self):
        temp = []
        temp.append( self.getAp1() )
        temp.append( self.getAp2() )
        temp.append( self.getAp3() )
        return temp

    # 取得三角形的三個角度與三個邊長
    def getASASAS(self):
        temp = []
        temp.append(self.getAp1())
        temp.append(self.getLenp1())
        temp.append(self.getAp2())
        temp.append(self.getLenp2())
        temp.append(self.getAp3())
        temp.append(self.getLenp3())
        return temp
    #2P 2L return mid P
    def setPPSS(self, p1, p3, lenp1, lenp3):
        temp = []
        self.p1 = p1
        self.p3 = p3
        self.lenp1 = lenp1
        self.lenp3 = lenp3

        #bp3 is the angle beside p3 point, cp3 is the angle for line23, p2 is the output
        line31 = Line(p3, p1)
        self.lenp2 = line31.getR()
        #self.lenp2 = self.p3.distance(self.p1)
        #這裡是求角3
        ap3 = math.acos(((self.lenp1 * self.lenp1 + self.lenp2 * self.lenp2) - self.lenp3 * self.lenp3) / (2 * self.lenp1 * self.lenp2))
        #ap3 = math.acos(((self.lenp1 * self.lenp1 + self.lenp3 * self.lenp3) - self.lenp2 * self.lenp2) / (2 * self.lenp1 * self.lenp3))
        bp3 = line31.getT()
        cp3 = bp3 - ap3
        temp.append(p3.x + self.lenp1*math.cos(cp3))#p2.x
        temp.append(p3.y + self.lenp1*math.sin(cp3))#p2.y
        return temp

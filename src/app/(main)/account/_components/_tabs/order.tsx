import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sizesImage } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

export const OrderTab = () => {
  const [isEmpty, setIsEmpty] = useState<boolean | "indeterminate">(false);
  return (
    <TabsContent
      value="order"
      className="bg-white p-5 flex flex-col text-sm gap-4"
    >
      <h4 className="font-bold text-lg">My Order</h4>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-2">
          <div className="flex w-full flex-col items-center justify-center p-2 bg-green-50 rounded-md border-green-200 border gap-2 text-sm">
            <p>Unpaid</p>
            <svg
              width="28"
              height="22"
              viewBox="0 0 28 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.0771 0.234694C20.9772 0.135083 21.9362 0.572952 22.3845 1.37003C22.6295 1.80555 22.7566 2.33101 22.9258 2.80109C23.0918 3.26256 23.2916 3.72176 23.4291 4.19203L24.2573 4.28423C25.5253 4.54079 26.5856 5.68043 26.7272 6.97049C26.7581 7.25255 26.7415 7.55195 26.7417 7.83604L26.7405 9.17882C26.7403 9.27311 26.7148 9.47202 26.7612 9.54188C27.7191 9.88647 27.9946 10.9732 27.9967 11.8825L27.9981 13.9401C27.9977 14.1695 28.0115 14.4105 27.9705 14.637C27.7703 15.7457 26.7783 16.1998 26.7581 16.2576C26.7456 16.2936 26.7517 16.3786 26.7501 16.419L26.745 18.2105C26.7445 18.5065 26.7643 18.8219 26.7263 19.1156C26.5049 20.8288 25.0951 21.7749 23.4611 21.778L7.98376 21.7782L3.56027 21.7792C1.93372 21.7785 0.598216 21.0573 0.118453 19.3839C-0.0304565 18.8644 0.00909666 18.3244 0.00928651 17.7895L0.00960276 8.74044C0.00947619 8.15752 -0.0238751 7.551 0.0344736 6.97182C0.169017 5.63663 1.24043 4.67571 2.48575 4.3303C2.5055 4.29094 2.50189 4.30398 2.51119 4.26727C2.8597 2.89266 3.81455 2.68616 5.01367 2.54339L19.1469 0.387654C19.4583 0.338165 19.763 0.267982 20.0771 0.234694Z"
                fill="#009B4C"
              />
              <path
                d="M20.4615 11.2297C21.7217 11.0483 22.5871 12.148 22.4032 13.3691L22.3985 13.3978C22.2747 14.2013 21.6575 14.6636 20.874 14.7782C18.4098 14.9769 18.1721 11.4824 20.4615 11.2297Z"
                fill="#C0FFDF"
              />
              <path
                d="M20.5519 12.2974C21.4682 12.2192 21.6608 13.4824 20.7053 13.6645C19.6611 13.6424 19.6542 12.4081 20.5519 12.2974Z"
                fill="#009B4C"
              />
              <path
                d="M3.32088 5.73291L23.6769 5.73905C24.3256 5.77886 24.9253 6.28039 25.1123 6.89476L25.123 6.93089C25.2313 7.28788 25.1811 7.74442 25.1806 8.11723L25.1739 9.66866C24.7814 9.70347 24.3668 9.67778 23.9723 9.67854L21.592 9.67955C20.9837 9.67948 20.3671 9.6405 19.7752 9.80662C17.3594 10.4847 16.5551 13.5847 18.3162 15.3373C19.2985 16.315 20.1626 16.3736 21.4146 16.3744L22.864 16.3743L25.1806 16.3864L25.1799 18.5611C25.177 19.5139 24.6487 20.1712 23.6403 20.2216L3.68774 20.2287C2.60082 20.2273 1.64275 19.949 1.55921 18.6201C1.52453 18.0688 1.55086 17.4983 1.55035 16.9452L1.54814 7.32434C1.58276 6.34557 2.40983 5.79379 3.32088 5.73291Z"
                fill="#C0FFDF"
              />
            </svg>
            <p className="font-bold">0</p>
          </div>
          <div className="flex w-full flex-col items-center justify-center p-2 bg-green-50 rounded-md border-green-200 border gap-2 text-sm">
            <p>Proceseed</p>
            <svg
              width="32"
              height="30"
              viewBox="0 0 32 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M23.7695 13.9223L23.8233 13.9206C25.79 13.8581 27.8355 14.6657 29.2641 16.0188C34.7 21.1669 31.5884 29.8446 23.8698 29.9989L23.8475 29.9951C23.7424 30.0119 23.6084 29.9958 23.5002 29.9927C19.3886 29.8761 15.89 26.5225 15.6885 22.3819C15.5853 20.2605 16.5467 18.1283 17.9533 16.5862C19.4091 14.9902 21.6248 14.0179 23.7695 13.9223ZM24.7545 18.2993C23.5792 18.5676 23.7521 19.5575 24.3499 20.3693C24.3865 20.4189 24.4064 20.4814 24.4585 20.5166C24.0367 20.545 23.6119 20.5366 23.1894 20.5378L20.369 20.5418C20.1269 20.5424 19.8622 20.517 19.6352 20.6113C18.7064 20.9973 18.5001 22.1704 19.3853 22.5232L19.5324 22.569C19.721 22.6229 19.9126 22.6142 20.1067 22.6146L20.8247 22.6154C21.1869 22.6157 24.5009 22.5862 24.5727 22.6247C24.7205 22.7038 24.3033 23.2814 24.2358 23.3642C24.0196 23.655 23.7671 23.9758 23.8192 24.3629C23.9006 24.9669 24.4353 25.3777 25.0428 25.2694C25.4047 25.2049 25.7193 24.8504 25.9808 24.6171L27.9606 22.8901C29.0164 21.9799 29.1276 21.5407 27.9226 20.5301L26.268 19.0732C25.8107 18.6583 25.4122 18.2724 24.7545 18.2993Z"
                fill="#009B4C"
              />
              <path
                d="M8.59585 1.50594L9.88571 0.966456C10.3523 0.754241 10.7941 0.488816 11.264 0.285727C12.7005 -0.33498 13.4133 0.167722 14.7218 0.661859L17.4903 1.63806L24.1434 3.81397C25.8309 4.37073 26.2733 4.84893 26.2767 6.75949L26.2772 8.77114C26.2729 9.95071 25.6591 10.7137 24.5638 11.0262C24.4484 11.0591 24.4697 11.0871 24.4292 11.2013C24.0162 12.3638 23.4848 12.2219 22.4005 12.4944C21.3497 12.7586 20.2778 13.0784 19.3148 13.5818C16.2856 15.1653 14.2222 18.6427 14.1127 22.0273L14.0958 22.8967C14.0941 23.1696 14.1135 23.5335 14.0177 23.7875C13.517 25.1155 10.6818 23.5387 9.87588 23.2102L4.68607 21.0801C3.03932 20.3846 1.90082 20.162 1.89555 17.9428L1.89436 11.72C1.8931 11.4922 1.90475 11.2541 1.87849 11.0281C1.15087 10.6796 0.736622 10.6007 0.293464 9.78132C-0.0974936 9.05833 0.016497 8.15766 0.015093 7.3689C0.0142365 6.88733 -0.0305578 6.3569 0.0383785 5.88143L0.0430397 5.84696C0.203299 4.72812 1.09815 4.04135 2.13697 3.78126C2.19397 3.76701 2.28123 3.73296 2.33872 3.73872C2.59566 3.69976 2.86424 3.58238 3.10945 3.49485L8.59585 1.50594Z"
                fill="#C0FFDF"
              />
              <path
                d="M8.59599 1.50586L8.62555 1.52938C8.82878 1.68515 9.1498 1.7842 9.38469 1.89322L14.2306 4.0763L18.7249 5.94685C19.0812 6.07587 19.4337 6.21375 19.8108 6.26506L14.6408 8.6473C13.8049 9.03684 14.158 8.98075 13.389 8.57534L11.0029 7.4565L2.60394 3.82892C2.52083 3.8002 2.41019 3.78743 2.33887 3.73864C2.5958 3.69968 2.86438 3.5823 3.10959 3.49476L8.59599 1.50586Z"
                fill="#009B4C"
              />
            </svg>
            <p className="font-bold">0</p>
          </div>
          <div className="flex w-full flex-col items-center justify-center p-2 bg-green-50 rounded-md border-green-200 border gap-2 text-sm">
            <p>Shipping</p>
            <svg
              width="32"
              height="22"
              viewBox="0 0 32 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.9241 5.34142C20.4907 4.49548 21.4929 4.43228 22.413 4.43188L23.6089 4.45114C25.2945 4.66436 26.4658 5.68118 27.5727 6.85628L28.5527 7.87329C29.3389 8.67648 30.1546 9.45949 30.853 10.3424C31.8946 11.6591 31.9973 12.6194 31.9969 14.1943C31.9967 15.3111 32.101 16.3655 31.1096 17.1326C30.6148 17.5157 30.0208 17.5818 29.4152 17.5734C29.3773 17.5729 29.3478 17.5547 29.3419 17.5936C28.5491 22.8697 22.4043 22.1297 21.9203 17.6558L17.3042 17.6303L16.6985 17.6307L16.5684 17.6C16.6181 17.559 16.7042 17.5419 16.765 17.521L17.1966 17.3721C17.2266 17.3321 17.4584 17.256 17.5191 17.2269C18.8526 16.5865 19.7441 15.1694 19.9071 13.7199C19.9581 13.2659 19.9277 12.783 19.9278 12.3251L19.927 10.3373L19.9241 5.34142ZM24.6737 6.8396C23.6074 6.99744 23.7463 7.82392 23.7455 8.63896C23.7445 9.69289 23.6694 10.6315 24.9331 11.0188C25.193 11.0984 25.5686 11.0548 25.843 11.0555L27.4036 11.0655C27.9403 11.024 28.4536 10.5564 28.2976 9.97673L28.2898 9.94675C28.151 9.45068 26.9114 8.42295 26.5213 8.04502C25.9811 7.52162 25.5166 6.79699 24.6737 6.8396Z"
                fill="#009B4C"
              />
              <path
                d="M2.84981 3.867L3.53236 3.85972C3.77828 2.85118 4.46255 1.9388 5.34853 1.39919C6.54216 0.672305 7.86233 0.732195 9.20592 0.731467L14.6052 0.727761C15.3613 0.726371 16.1655 0.659863 16.9049 0.84271C18.7067 1.28841 19.8694 2.70712 19.8774 4.55365C19.8786 4.80334 19.8545 5.10008 19.9244 5.34136L19.9277 10.3373L19.9278 12.325C19.9277 12.783 19.9582 13.2659 19.9071 13.7198C19.7441 15.1694 18.8526 16.5864 17.5191 17.2268C17.4585 17.2559 17.2266 17.332 17.1966 17.372L16.7651 17.521C16.7042 17.5418 16.6181 17.559 16.5684 17.5999L16.6985 17.6287L14.1681 17.5833C14.1699 17.8349 14.1695 18.103 14.1193 18.3698C13.6142 21.0552 10.1435 22.292 8.15318 20.2659C7.655 19.7588 7.1001 18.8424 7.06794 18.0984L7.0322 17.8414L7.01897 17.7587C6.99415 17.6247 6.81911 17.6928 6.71422 17.6888C5.97628 17.6601 5.17958 17.3841 4.5722 16.9769C3.10625 15.9942 2.81494 14.3745 2.8164 12.7265L2.81779 10.433C2.81878 10.1599 2.81481 9.86827 2.86762 9.60005L2.90143 9.38464C2.91076 9.31496 2.92632 9.28359 2.97555 9.23356L2.98971 9.21966C2.83406 9.19458 2.66796 9.21278 2.509 9.19511L2.48293 9.192L1.81302 9.18664C1.67789 9.18525 1.52601 9.19213 1.39494 9.15991L1.36838 9.15283C0.594164 8.95218 0.697393 7.85225 1.52177 7.71877C1.95576 7.65153 2.4106 7.74789 2.83665 7.68508C2.79198 7.04998 2.93922 6.04231 3.07429 5.43732C3.14185 5.42044 3.19685 5.38861 3.20115 5.31323C3.1177 5.31191 3.02975 5.31509 2.94815 5.29623L2.90746 5.2861L0.842639 5.27392C0.705963 5.27247 0.5703 5.27849 0.444385 5.21655L0.417081 5.20279C-0.131918 4.94271 -0.155331 4.06791 0.444676 3.87534L0.468778 3.86819C0.654457 3.81161 0.950653 3.86071 1.14798 3.86164L2.84981 3.867Z"
                fill="#C0FFDF"
              />
              <path
                d="M2.90746 5.2777L0.842639 5.274C0.705963 5.27254 0.5703 5.27856 0.444385 5.21662L0.417081 5.20286C-0.131918 4.94278 -0.155331 4.06799 0.444676 3.87541L0.468778 3.86826C0.654457 3.81168 0.950653 3.86079 1.14798 3.86171L2.84981 3.86707L5.19301 3.87091C5.34654 3.87157 5.50795 3.868 5.65738 3.90658L5.68398 3.91307C6.26144 4.06461 6.16171 5.16394 5.37963 5.2603C4.81488 5.32985 3.49577 5.30973 2.90746 5.2777Z"
                fill="#009B4C"
              />
              <path
                d="M1.52182 7.71882L12.3983 7.68746C12.7791 7.68752 13.3768 7.59104 13.7204 7.79791L13.7492 7.81485C14.2976 8.14811 14.2593 8.96123 13.6319 9.1509L13.5991 9.16122C13.4528 9.2035 13.289 9.18994 13.1377 9.18914L10.4328 9.18504L2.48298 9.18842L1.81307 9.1867C1.67793 9.18531 1.52606 9.19219 1.39499 9.15996L1.36842 9.15288C0.59421 8.95223 0.69744 7.8523 1.52182 7.71882Z"
                fill="#009B4C"
              />
              <path
                d="M9.71003 14.2124C11.7583 13.654 13.9359 15.1354 14.1363 17.2198C14.1469 17.3302 14.1434 17.4575 14.1682 17.5646C14.1699 17.8348 14.1695 18.1029 14.1193 18.3697C13.6142 21.0551 10.1436 22.2919 8.15322 20.2658C7.65504 19.7587 7.10014 18.8423 7.06798 18.0983L7.03224 17.8413C7.02708 16.2445 8.12509 14.6174 9.71003 14.2124Z"
                fill="#009B4C"
              />
            </svg>
            <p className="font-bold">0</p>
          </div>
          <div className="flex w-full flex-col items-center justify-center p-2 bg-green-50 rounded-md border-green-200 border gap-2 text-sm">
            <p>Completed</p>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.12231 5.65688C0.819359 4.91574 1.78558 4.55044 2.28772 4.24194L8.06351 0.987537C10.2638 -0.240374 11.1256 -0.383406 13.4998 0.899691L18.4245 3.6674C19.009 3.99167 19.5953 4.28988 20.158 4.65301C20.5671 4.91695 20.8855 5.06658 20.864 5.60387C20.5733 5.9024 20.1689 6.12475 19.8173 6.34686L14.6443 9.38623C11.4513 11.2139 10.9203 11.7874 7.72435 9.87051L3.43929 7.32788C2.69075 6.87981 1.88558 6.41419 1.25706 5.80715L1.12231 5.65688Z"
                fill="#009B4C"
              />
              <path
                d="M23.0909 15.2184C23.5617 15.1964 24.0485 15.1791 24.5178 15.2152C27.7698 15.4651 30.7271 17.9663 31.6371 21.0729C31.7744 21.5417 31.8447 22.0013 31.9328 22.479L31.9474 22.5693C32.1913 24.6605 31.5792 26.9532 30.2412 28.5776C28.6712 30.4833 26.831 31.4087 24.3451 31.6414C23.8268 31.6552 23.2969 31.6735 22.7814 31.6157C16.6709 30.9299 13.1882 23.2207 17.2966 18.2823C18.7664 16.5157 20.8158 15.4273 23.0909 15.2184ZM26.1835 20.1103C25.7606 20.2104 25.5876 20.4933 25.3512 20.839L23.3661 24.0208C23.1562 24.359 22.9583 24.7358 22.7064 25.0441L21.3387 23.6225C20.9319 23.1932 20.527 22.6228 19.8688 22.6501L19.7208 22.6677C19.1229 22.7584 18.7448 23.3975 18.8647 23.9716C18.9323 24.2958 19.2364 24.5741 19.4523 24.8067L20.0653 25.4676L21.3979 26.8463C21.9623 27.4092 22.8219 28.1308 23.612 27.4024C23.7939 27.2346 23.9227 27.0198 24.0544 26.8128L25.5086 24.5315C26.1035 23.6091 26.777 22.7144 27.3045 21.7513C27.7359 20.9638 27.3835 20.1145 26.4014 20.1038L26.1835 20.1103Z"
                fill="#009B4C"
              />
              <path
                d="M20.8639 5.604C20.9028 5.73658 20.976 5.73046 21.0849 5.80906C21.9628 6.44337 21.9437 7.67578 21.9449 8.64715L21.9298 14.0396L21.6594 14.0943C21.3054 14.1487 20.9348 14.2854 20.5969 14.4034C17.2919 15.5571 14.9097 18.3917 14.3047 21.8358C14.2293 22.2646 14.2106 22.8206 13.9584 23.1849C13.3654 24.0416 12.1279 23.9839 11.2125 23.9889C8.56964 24.0032 8.42041 23.859 6.25218 22.4519L1.61517 19.3627C0.30368 18.4184 0.0485885 17.4129 0.0473014 15.9132L0 8.17502C0.00032178 7.38626 0.101361 6.32688 0.816517 5.8426C0.909109 5.77994 1.05286 5.74269 1.12221 5.65702L1.25695 5.80729C1.88547 6.41433 2.69064 6.87994 3.43918 7.32802L7.72424 9.87064C10.9202 11.7876 11.4512 11.2141 14.6442 9.38636L19.8172 6.34699C20.1687 6.12488 20.5731 5.90254 20.8639 5.604Z"
                fill="#C0FFDF"
              />
            </svg>
            <p className="font-bold">0</p>
          </div>
        </div>
        <Tabs defaultValue="processed" className="gap-0 h-full">
          <TabsList className="w-full bg-transparent gap-1 h-12 p-0 shadow-none *:w-full *:h-12 *:flex-auto *:rounded-none *:shadow-none *:text-gray-500 *:bg-white *:hover:bg-green-50 *:hover:text-green-600 *:border-0 *:border-b-2 *:border-gray-300 *:data-[state=active]:shadow-none *:data-[state=active]:border-green-600 *:data-[state=active]:text-green-600 *:hover:data-[state=active]:bg-green-50">
            <TabsTrigger value="processed" asChild>
              <Button>Processed</Button>
            </TabsTrigger>
            <TabsTrigger value="shipping" asChild>
              <Button>Shipping</Button>
            </TabsTrigger>
            <TabsTrigger value="completed" asChild>
              <Button>Completed</Button>
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="processed"
            className="flex flex-col text-sm pt-5 gap-4"
          >
            <Label className="flex justify-between px-5 py-2 border rounded-md items-center">
              <p>Make Empty (Dev Mode)</p>
              <Checkbox checked={isEmpty} onCheckedChange={setIsEmpty} />
            </Label>
            {isEmpty ? (
              <div className="flex p-3 border border-red-500 rounded-md gap-3 items-center">
                <div className="size-8 rounded-full bg-red-500 flex items-center justify-center">
                  <ShoppingCart className="text-white size-4 flex-none " />
                </div>
                <div className="flex flex-col w-full">
                  <h5 className="font-semibold text-red-500 text-lg">
                    You haven&apos;t placed an order yet!
                  </h5>
                  <p className="text-gray-700 text-sm">
                    Explore, shop now, and find amazing deals just for you and
                    your pets!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {Array.from({ length: 3 }, (_, i) => (
                  <Card key={i} className="rounded-md shadow-none">
                    <CardContent className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-xs">Order No:</p>
                          <p className="font-semibold">12345678</p>
                        </div>
                        <p className="uppercase text-green-700">Processed</p>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex gap-4">
                        <div className="relative size-20 rounded overflow-hidden bg-white border flex-none">
                          <Image
                            alt="product"
                            src={"/assets/images/product-1.png"}
                            fill
                            sizes={sizesImage}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col w-full">
                          <h5 className="line-clamp-1 font-bold">ITRACA</h5>
                          <div className="flex items-center justify-between w-full">
                            <p>x8</p>
                            <p>Rp 1.000.000</p>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="w-full flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <p>Total Order:</p>
                          <p className="font-bold text-lg">Rp 1.000.000</p>
                        </div>
                        <Button>Detail Order</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
          <TabsContent
            value="shipping"
            className="flex flex-col text-sm pt-5 gap-4"
          >
            <Label className="flex justify-between px-5 py-2 border rounded-md items-center">
              <p>Make Empty (Dev Mode)</p>
              <Checkbox checked={isEmpty} onCheckedChange={setIsEmpty} />
            </Label>
            {isEmpty ? (
              <div className="flex p-3 border border-red-500 rounded-md gap-3 items-center">
                <div className="size-8 rounded-full bg-red-500 flex items-center justify-center">
                  <ShoppingCart className="text-white size-4 flex-none " />
                </div>
                <div className="flex flex-col w-full">
                  <h5 className="font-semibold text-red-500 text-lg">
                    You haven&apos;t placed an order yet!
                  </h5>
                  <p className="text-gray-700 text-sm">
                    Explore, shop now, and find amazing deals just for you and
                    your pets!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {Array.from({ length: 3 }, (_, i) => (
                  <Card key={i} className="rounded-md shadow-none">
                    <CardContent className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-xs">Order No:</p>
                          <p className="font-semibold">12345678</p>
                        </div>
                        <p className="uppercase text-green-700">Shipping</p>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex gap-4">
                        <div className="relative size-20 rounded overflow-hidden bg-white border flex-none">
                          <Image
                            alt="product"
                            src={"/assets/images/product-1.png"}
                            fill
                            sizes={sizesImage}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col w-full">
                          <h5 className="line-clamp-1 font-bold">ITRACA</h5>
                          <div className="flex items-center justify-between w-full">
                            <p>x8</p>
                            <p>Rp 1.000.000</p>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="w-full flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <p>Total Order:</p>
                          <p className="font-bold text-lg">Rp 1.000.000</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button>Track Order</Button>
                          <Button>Detail Order</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
          <TabsContent
            value="completed"
            className="flex flex-col text-sm pt-5 gap-4"
          >
            <Label className="flex justify-between px-5 py-2 border rounded-md items-center">
              <p>Make Empty (Dev Mode)</p>
              <Checkbox checked={isEmpty} onCheckedChange={setIsEmpty} />
            </Label>
            {isEmpty ? (
              <div className="flex p-3 border border-red-500 rounded-md gap-3 items-center">
                <div className="size-8 rounded-full bg-red-500 flex items-center justify-center">
                  <ShoppingCart className="text-white size-4 flex-none " />
                </div>
                <div className="flex flex-col w-full">
                  <h5 className="font-semibold text-red-500 text-lg">
                    You haven&apos;t placed an order yet!
                  </h5>
                  <p className="text-gray-700 text-sm">
                    Explore, shop now, and find amazing deals just for you and
                    your pets!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {Array.from({ length: 3 }, (_, i) => (
                  <Card key={i} className="rounded-md shadow-none">
                    <CardContent className="flex flex-col w-full">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-xs">Order No:</p>
                          <p className="font-semibold">12345678</p>
                        </div>
                        <p className="uppercase text-green-700">Completed</p>
                      </div>
                      <Separator className="my-4" />
                      <div className="flex gap-4">
                        <div className="relative size-20 rounded overflow-hidden bg-white border flex-none">
                          <Image
                            alt="product"
                            src={"/assets/images/product-1.png"}
                            fill
                            sizes={sizesImage}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex flex-col w-full">
                          <h5 className="line-clamp-1 font-bold">ITRACA</h5>
                          <div className="flex items-center justify-between w-full">
                            <p>x8</p>
                            <p>Rp 1.000.000</p>
                          </div>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div className="w-full flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <p>Total Order:</p>
                          <p className="font-bold text-lg">Rp 1.000.000</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button>Review Order</Button>
                          <Button>Track Order</Button>
                          <Button>Detail Order</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TabsContent>
  );
};
